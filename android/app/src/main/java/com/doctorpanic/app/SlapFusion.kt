package com.doctorpanic.app

/**
 * Combines the microphone and the accelerometer. A slap is a sharp sound
 * ([SlapDetector]) with a jolt of the phone ([JoltDetector]) close to it in
 * time. A very loud slap counts on its own, so the game still works with the
 * phone on a stand or a soft surface, or without an accelerometer.
 * Times are in nanoseconds on one clock (elapsedRealtimeNanos).
 */
class SlapFusion(private val hasAccelerometer: Boolean) {

    private var lastJolt = Long.MIN_VALUE
    private var pendingSound = Long.MIN_VALUE

    /** A sharp sound at [time]; returns true if that makes a slap. */
    @Synchronized
    fun onSound(time: Long, peak: Float): Boolean {
        if (!hasAccelerometer || peak >= STRONG_PEAK) return true
        // The sound is reported after its decay is confirmed, so the jolt
        // usually came first
        if (lastJolt != Long.MIN_VALUE && time - lastJolt in 0..JOLT_BEFORE_NS) return true
        pendingSound = time
        return false
    }

    /** A jolt at [time]; returns true if it confirms a recent sound. */
    @Synchronized
    fun onJolt(time: Long): Boolean {
        lastJolt = time
        if (pendingSound != Long.MIN_VALUE && time - pendingSound in -JOLT_BEFORE_NS..JOLT_AFTER_NS) {
            pendingSound = Long.MIN_VALUE
            return true
        }
        return false
    }

    companion object {
        /** Sound peak (0..1) that counts as a slap without a jolt. */
        const val STRONG_PEAK = 0.7f

        private const val JOLT_BEFORE_NS = 500_000_000L
        private const val JOLT_AFTER_NS = 200_000_000L
    }
}
