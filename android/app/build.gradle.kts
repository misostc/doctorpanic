plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.doctorpanic.app"
    compileSdk = 35
    // The one installed in the Docker image; otherwise AGP downloads 34 each build
    buildToolsVersion = "35.0.0"

    defaultConfig {
        applicationId = "com.doctorpanic.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    // Release signing key comes from the environment (CI secrets), never the repo
    val keystore = System.getenv("ANDROID_KEYSTORE_FILE")
    signingConfigs {
        if (keystore != null) {
            create("release") {
                storeFile = file(keystore)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias = "doctorpanic"
                keyPassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            if (keystore != null) {
                signingConfig = signingConfigs["release"]
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        buildConfig = true
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/webassets"))
}

// The web game in the repo root is the single source of the UI; copy it into
// the APK assets on every build. Cordova leftovers and the trailer are not
// shipped.
val copyWebAssets by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile) {
        include("pages/**", "js/**", "css/**", "i18n/**", "images/**", "img/**", "fonts/**", "sounds/**")
        exclude("pages/trailer.html")
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
