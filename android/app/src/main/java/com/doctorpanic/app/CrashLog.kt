package com.doctorpanic.app

import android.content.Context
import android.os.Build
import java.io.File

/** Keeps the last crash in a file so the next launch can show it. */
object CrashLog {

    private fun file(context: Context) = File(context.filesDir, "last-crash.txt")

    fun install(context: Context) {
        val app = context.applicationContext
        val previous = Thread.getDefaultUncaughtExceptionHandler()
        if (previous is Handler) return
        Thread.setDefaultUncaughtExceptionHandler(Handler(app, previous))
    }

    fun write(context: Context, report: String) {
        val header = "App ${BuildConfig.VERSION_NAME}, Android ${Build.VERSION.RELEASE}, ${Build.MANUFACTURER} ${Build.MODEL}\n"
        try {
            file(context).writeText(header + report)
        } catch (_: Exception) {
        }
    }

    /** Returns the saved report and deletes it. */
    fun take(context: Context): String? {
        val f = file(context)
        if (!f.exists()) return null
        val report = f.readText()
        f.delete()
        return report
    }

    private class Handler(
        private val context: Context,
        private val previous: Thread.UncaughtExceptionHandler?,
    ) : Thread.UncaughtExceptionHandler {
        override fun uncaughtException(thread: Thread, error: Throwable) {
            write(context, "Thread ${thread.name}: ${error.stackTraceToString()}")
            previous?.uncaughtException(thread, error)
        }
    }
}
