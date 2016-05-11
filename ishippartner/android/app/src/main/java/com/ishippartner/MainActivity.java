package com.ishippartner;
// START
import com.magus.fblogin.FacebookLoginPackage; // <--- import
import com.AirMaps.AirPackage; // <--- This!
import com.zmxv.RNSound.RNSoundPackage;

// END
import com.facebook.react.ReactActivity;
import com.tiagojdferreira.RNGeolocationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

//
import android.os.*;
import android.content.Context;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.WifiLock;
//

public class MainActivity extends ReactActivity {
    private PowerManager.WakeLock wl;
    private WifiLock lock;
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ishippartner";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PartialWakeLockTag");
        wl.acquire();
        WifiManager wifiManager = (WifiManager) getSystemService(Context.WIFI_SERVICE);
        lock = wifiManager.createWifiLock(WifiManager.WIFI_MODE_FULL, "LockTag");
        lock.acquire();
    }
    protected void onDestroy()
    {
        super.onDestroy();
        wl.release();
        lock.release();
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new RNGeolocationPackage(),
            new VectorIconsPackage(),
            new FacebookLoginPackage(), // <------ add the package
            new AirPackage(),
             new RNSoundPackage()
        );
    }
}
