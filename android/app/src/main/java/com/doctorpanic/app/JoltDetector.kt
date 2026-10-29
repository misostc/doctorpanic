package com.doctorpanic.app

import kotlin.math.sqrt

/**
 * Turns accelerometer readings into "how hard was the phone just jolted":
 * the distance (m/s²) of the reading from a slowly tracked gravity vector.
 * Lying on the table, a slap next to the phone gives a sharp spike; the
 * alarm playing through the speaker does not.
 */
class JoltDetector {

    private val gravity = FloatArray(3)
    private var initialized = false

    /** Returns the jolt in m/s² for one reading. */
    fun process(x: Float, y: Float, z: Float): Float {
        if (!initialized) {
            gravity[0] = x; gravity[1] = y; gravity[2] = z
            initialized = true
            return 0f
        }
        val dx = x - gravity[0]
        val dy = y - gravity[1]
        val dz = z - gravity[2]
        gravity[0] += dx * GRAVITY_ALPHA
        gravity[1] += dy * GRAVITY_ALPHA
        gravity[2] += dz * GRAVITY_ALPHA
        return sqrt(dx * dx + dy * dy + dz * dz)
    }

    companion object {
        /** Jolt that counts as the table being hit. */
        const val THRESHOLD = 1.5f

        private const val GRAVITY_ALPHA = 0.1f
    }
}
