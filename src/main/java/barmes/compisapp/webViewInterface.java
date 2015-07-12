package barmes.compisapp;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class webViewInterface {
    Context mContext;

    webViewInterface(Context c){
        mContext = c;
        saveCookie("");
    }

    String filename = "cookie";
    @JavascriptInterface
    public void saveCookie(String cadena){
        Log.e("Error", "Entra en guardar cookie");
        FileOutputStream fos;
        try{
            fos = mContext.openFileOutput(filename, mContext.MODE_PRIVATE);
            fos.write(cadena.getBytes());
            fos.close();
        }catch(IOException ioe) {
            Log.e("Error","Error al guardar cookie");
        }
    }
    @JavascriptInterface
    public String getCookie(){
        Log.e("Error","entra en leer cookie");
        FileInputStream fis;
        String cadena = "";
        try{
            int c;
            fis = mContext.openFileInput(filename);
            cadena = "";
            while((c=fis.read()) != -1){
                cadena = cadena + Character.toString((char)c);
                Log.e("caracter",cadena);
            }
            fis.close();
        }catch(IOException ioe) {
            Log.e("Error","Error al leer cookie");
        }
        Log.e("Error",cadena);
        return cadena;
    }


}