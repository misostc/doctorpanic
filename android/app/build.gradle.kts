plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.doctorpanic.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.doctorpanic.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webassets"))
}

// The web game in the repo root is the single source of the UI; copy it into
// the APK assets on every build. Cordova leftovers, the trailer and the debug
// helper are not shipped.
val copyWebAssets by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile) {
        include("pages/**", "js/**", "css/**", "i18n/**", "images/**", "img/**", "fonts/**", "sounds/**")
        exclude("pages/trailer.html", "js/debug.js")
    }
    into(layout.buildDirectory.dir("generated/webassets"))
}
tasks.named("preBuild") { dependsOn(copyWebAssets) }

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")
    testImplementation("junit:junit:4.13.2")
}
