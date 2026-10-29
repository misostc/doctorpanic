package com.doctorpanic.app

import android.annotation.SuppressLint
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log

/**
 * Records from the microphone on a background thread and feeds [SlapDetector],
 * watches the accelerometer with [JoltDetector], and decides with [SlapFusion].
 * Callbacks run on the main thread: [onLevel] gets the sound peak (0..1) and
 * whether the phone was jolted since the last update. Stops itself after a slap.
 */
class SlapListener(
    private val context: Context,
    private val onLevel: (level: Float, jolted: Boolean) -> Unit,
    private val onSlap: () -> Unit,
) {
    private val main = Handler(Looper.getMainLooper())
    private val sensors = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer: Sensor? = sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

    private var fusion = SlapFusion(accelerometer != null)
    private var joltDetector = JoltDetector()

    @Volatile
    private var jolted = false

    private val accelListener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            if (joltDetector.process(event.values[0], event.values[1], event.values[2]) < JoltDetector.THRESHOLD) return
            jolted = true
            if (fusion.onJolt(event.timestamp)) slapped()
        }

        override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
    }

    @Volatile
    private var running = false
    private var thread: Thread? = null

    /** Caller must hold RECORD_AUDIO. Does nothing if already listening. */
    fun start() {
        if (running) return
        running = true
        fusion = SlapFusion(accelerometer != null)
        joltDetector = JoltDetector()
        accelerometer?.let { sensors.registerListener(accelListener, it, SensorManager.SENSOR_DELAY_FASTEST) }
        thread = Thread(::record, "slap-listener").apply { start() }
    }

    fun stop() {
        running = false
        sensors.unregisterListener(accelListener)
        thread?.join(500)
        thread = null
    }

    /** Called from the audio thread or the sensor (main) thread; fires once. */
    @Synchronized
    private fun slapped() {
        if (!running) return
        running = false
        main.post {
            sensors.unregisterListener(accelListener)
            onSlap()
        }
    }

    @SuppressLint("MissingPermission")
    private fun record() {
        val minBuffer = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
        val recorder = try {
            AudioRecord(audioSource(), SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, maxOf(minBuffer, SAMPLE_RATE / 5))
        } catch (e: Exception) {
            Log.w(TAG, "Cannot open microphone", e)
            running = false
            return
        }
        if (recorder.state != AudioRecord.STATE_INITIALIZED) {
            recorder.release()
            running = false
            return
        }

        val detector = SlapDetector(SAMPLE_RATE)
        val buffer = ShortArray(SAMPLE_RATE / 100)
        var lastLevel = 0L
        try {
            recorder.startRecording()
            while (running) {
                val read = recorder.read(buffer, 0, buffer.size)
                if (read <= 0) continue
                if (detector.process(buffer, read) &&
                    fusion.onSound(SystemClock.elapsedRealtimeNanos(), detector.slapPeak)
                ) {
                    slapped()
                    break
                }
                val now = SystemClock.uptimeMillis()
                if (now - lastLevel >= LEVEL_INTERVAL_MS) {
                    lastLevel = now
                    val level = detector.takeLevel()
                    val joltedNow = jolted
                    jolted = false
                    main.post { if (running) onLevel(level, joltedNow) }
                }
            }
        } finally {
            try {
                recorder.stop()
            } catch (_: IllegalStateException) {
            }
            recorder.release()
        }
    }

    /** Unprocessed input keeps transients sharp; AGC/noise suppression flattens them. */
    private fun audioSource(): Int {
        val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val unprocessed = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N &&
                audio.getProperty(AudioManager.PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED) == "true"
        return if (unprocessed) MediaRecorder.AudioSource.UNPROCESSED else MediaRecorder.AudioSource.VOICE_RECOGNITION
    }

    companion object {
        private const val TAG = "SlapListener"
        const val SAMPLE_RATE = 44100
        private const val LEVEL_INTERVAL_MS = 50L
    }
}
