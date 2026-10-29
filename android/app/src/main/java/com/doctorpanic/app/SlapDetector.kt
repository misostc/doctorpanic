package com.doctorpanic.app

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.sqrt

/**
 * Detects a hand slap on the table in a stream of 16-bit PCM samples.
 *
 * The cardiac-arrest alarm plays through the speaker while we listen, so a
 * plain loudness threshold is not enough. A slap is a short, sharp transient:
 *  1. a 10 ms frame whose peak is loud in absolute terms, far above the
 *     running background level (the alarm included) and a jump over the
 *     frame before, and
 *  2. whose energy dies away within [DECAY_FRAMES] frames, which a sustained
 *     sound such as an alarm beep does not.
 * The first [WARMUP_MS] are only used to learn the background, so the onset
 * of the alarm itself cannot trigger.
 */
class SlapDetector(sampleRate: Int) {

    private val frameSize = sampleRate / 100
    private val warmupFrames = WARMUP_MS / 10
    private val frame = FloatArray(frameSize)
    private var frameFill = 0
    private var frames = 0

    private var background = 0f
    private var candidateRms = 0f
    private var candidatePeak = 0f
    private var candidateAge = -1
    private var previousRms = 0f

    /** Highest frame peak since the last [takeLevel], for the level meter. */
    private var levelPeak = 0f

    /** Returns the peak (0..1 of full scale) since the last call and resets it. */
    fun takeLevel(): Float {
        val level = levelPeak
        levelPeak = 0f
        return level
    }

    /** Peak (0..1) of the last detected slap, to judge how sure we are. */
    var slapPeak = 0f
        private set

    /** Feeds [count] samples; returns true when a slap has been detected.
     *  Can keep being fed afterwards to detect the next one. */
    fun process(samples: ShortArray, count: Int): Boolean {
        for (i in 0 until count) {
            frame[frameFill++] = samples[i] / 32768f
            if (frameFill == frameSize) {
                frameFill = 0
                if (processFrame()) {
                    return true
                }
            }
        }
        return false
    }

    private fun processFrame(): Boolean {
        var peak = 0f
        var sum = 0f
        for (s in frame) {
            peak = max(peak, abs(s))
            sum += s * s
        }
        val rms = sqrt(sum / frameSize)
        levelPeak = max(levelPeak, peak)
        frames++

        // Background tracks every frame, so a sound that outlasts the decay
        // window becomes background instead of a fresh onset
        val quietBefore = max(background, NOISE_FLOOR)
        val previous = previousRms
        background += (rms - background) * BACKGROUND_ALPHA
        previousRms = rms

        if (candidateAge >= 0) {
            candidateAge++
            if (rms < candidateRms * DECAY_RATIO) {
                candidateAge = -1
                slapPeak = candidatePeak
                return true
            }
            if (candidateAge < DECAY_FRAMES) {
                return false
            }
            // Did not die away: a sustained sound, not a slap
            candidateAge = -1
            return false
        }

        if (frames > warmupFrames
            && peak >= MIN_PEAK
            && peak >= quietBefore * PEAK_TO_BACKGROUND
            && rms >= max(previous, NOISE_FLOOR) * ONSET_JUMP
        ) {
            candidateRms = rms
            candidatePeak = peak
            candidateAge = 0
        }
        return false
    }

    companion object {
        const val WARMUP_MS = 400

        /** Absolute peak a slap must reach (fraction of full scale). */
        const val MIN_PEAK = 0.25f

        /** Peak vs. running background RMS. */
        const val PEAK_TO_BACKGROUND = 5f

        /** An onset frame's RMS must jump this much over the previous frame. */
        const val ONSET_JUMP = 2f

        /** Frame RMS must fall below this fraction of the onset frame... */
        const val DECAY_RATIO = 0.25f

        /** ...within this many 10 ms frames. */
        const val DECAY_FRAMES = 8

        /** Background RMS smoothing per frame (~0.5 s time constant). */
        const val BACKGROUND_ALPHA = 0.02f

        private const val NOISE_FLOOR = 0.005f
    }
}
