package com.doctorpanic.app

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SlapFusionTest {

    private val ms = 1_000_000L

    @Test
    fun soundWithEarlierJolt_isSlap() {
        val fusion = SlapFusion(hasAccelerometer = true)
        assertFalse(fusion.onJolt(1000 * ms))
        assertTrue(fusion.onSound(1100 * ms, 0.3f))
    }

    @Test
    fun soundThenJolt_isSlap() {
        val fusion = SlapFusion(hasAccelerometer = true)
        assertFalse(fusion.onSound(1000 * ms, 0.3f))
        assertTrue(fusion.onJolt(1050 * ms))
    }

    @Test
    fun soundWithoutJolt_isNotSlap() {
        val fusion = SlapFusion(hasAccelerometer = true)
        assertFalse(fusion.onSound(1000 * ms, 0.3f))
        assertFalse(fusion.onJolt(2000 * ms))
    }

    @Test
    fun oldJolt_doesNotCount() {
        val fusion = SlapFusion(hasAccelerometer = true)
        fusion.onJolt(1000 * ms)
        assertFalse(fusion.onSound(3000 * ms, 0.3f))
    }

    @Test
    fun veryLoudSound_aloneIsSlap() =
        assertTrue(SlapFusion(hasAccelerometer = true).onSound(1000 * ms, SlapFusion.STRONG_PEAK))

    @Test
    fun noAccelerometer_soundAloneIsSlap() =
        assertTrue(SlapFusion(hasAccelerometer = false).onSound(1000 * ms, 0.3f))
}
