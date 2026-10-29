package com.doctorpanic.app

import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.random.Random

class JoltDetectorTest {

    @Test
    fun phoneLyingStill_noJolt() {
        val detector = JoltDetector()
        val random = Random(1)
        var max = 0f
        repeat(400) {
            max = maxOf(max, detector.process(0.02f * random.nextFloat(), 0.02f * random.nextFloat(), 9.81f))
        }
        assertTrue("max $max", max < JoltDetector.THRESHOLD)
    }

    @Test
    fun tableHit_jolts() {
        val detector = JoltDetector()
        repeat(200) { detector.process(0f, 0f, 9.81f) }
        assertTrue(detector.process(0.5f, -0.3f, 13f) >= JoltDetector.THRESHOLD)
    }

    @Test
    fun slowTilt_noJolt() {
        val detector = JoltDetector()
        var max = 0f
        // Picking the phone up over one second at 200 Hz
        for (i in 0..200) {
            val t = i / 200f
            max = maxOf(max, detector.process(0f, 9.81f * t, 9.81f * (1 - t)))
        }
        assertTrue("max $max", max < JoltDetector.THRESHOLD)
    }
}
