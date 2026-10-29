package com.doctorpanic.app

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.random.Random

class SlapDetectorTest {

    private val rate = SlapListener.SAMPLE_RATE

    private fun silence(seconds: Double) = FloatArray((seconds * rate).toInt())

    /** Alarm-like beeping: 1 kHz tone, [onMs] on / [offMs] off. */
    private fun beeping(seconds: Double, amplitude: Float, onMs: Int = 150, offMs: Int = 150) =
        FloatArray((seconds * rate).toInt()) { i ->
            val ms = i * 1000 / rate
            if (ms % (onMs + offMs) < onMs) amplitude * sin(2 * PI * 1000 * i / rate).toFloat() else 0f
        }

    /** Slap: noise burst decaying with a [tauMs] time constant. */
    private fun slap(amplitude: Float, tauMs: Double = 10.0): FloatArray {
        val random = Random(1)
        return FloatArray(rate / 5) { i ->
            amplitude * exp(-i * 1000.0 / rate / tauMs).toFloat() * (random.nextFloat() * 2 - 1)
        }
    }

    private fun mix(base: FloatArray, add: FloatArray, atSeconds: Double): FloatArray {
        val out = base.copyOf()
        val start = (atSeconds * rate).toInt()
        for (i in add.indices) {
            if (start + i < out.size) out[start + i] = (out[start + i] + add[i]).coerceIn(-1f, 1f)
        }
        return out
    }

    /** Feeds audio in 10 ms reads, as SlapListener does. */
    private fun detects(audio: FloatArray): Boolean {
        val detector = SlapDetector(rate)
        val pcm = ShortArray(audio.size) { (audio[it] * 32767).roundToInt().toShort() }
        val chunk = rate / 100
        var i = 0
        while (i < pcm.size) {
            val n = minOf(chunk, pcm.size - i)
            if (detector.process(pcm.copyOfRange(i, i + n), n)) return true
            i += n
        }
        return false
    }

    @Test
    fun quietRoom_noTrigger() = assertFalse(detects(silence(3.0)))

    @Test
    fun loudBeepingAlarm_noTrigger() = assertFalse(detects(beeping(3.0, 0.6f)))

    @Test
    fun shortBeeps_noTrigger() = assertFalse(detects(beeping(3.0, 0.5f, onMs = 100, offMs = 400)))

    @Test
    fun continuousTone_noTrigger() = assertFalse(detects(beeping(3.0, 0.8f, onMs = 1000, offMs = 0)))

    @Test
    fun slapInQuietRoom_triggers() = assertTrue(detects(mix(silence(2.0), slap(0.9f), 1.0)))

    @Test
    fun slapOverAlarm_triggers() = assertTrue(detects(mix(beeping(3.0, 0.3f), slap(1.0f), 1.47)))

    @Test
    fun slapDuringWarmup_ignored() = assertFalse(detects(mix(silence(1.0), slap(0.9f), 0.1)))

    @Test
    fun quietTap_noTrigger() = assertFalse(detects(mix(silence(2.0), slap(0.1f), 1.0)))

    @Test
    fun alarmStartingFromSilence_noTrigger() =
        assertFalse(detects(silence(0.6) + beeping(2.0, 0.6f)))
}
