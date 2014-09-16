import java.io.*;

public class EscribeFichero
{
    public static void main(String[] args)
    {
        File miDir = new File (".");
        try {
            System.out.println ("Directorio actual: " + miDir.getCanonicalPath());
        }
        catch(Exception e) {
            e.printStackTrace();
        }

        File archivo = null;
        FileReader fr = null;
        BufferedReader br = null;


        FileWriter fichero = null;
        PrintWriter pw = null;
        try
        {
            fichero = new FileWriter("resultado.json");
            pw = new PrintWriter(fichero);
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            // Apertura del fichero y creacion de BufferedReader para poder
            // hacer una lectura comoda (disponer del metodo readLine()).
            archivo = new File ("ficticio.json");
            fr = new FileReader (archivo);
            br = new BufferedReader(fr);

            // Lectura del fichero
            String linea;
            while((linea=br.readLine())!=null)
                try
                {
                    pw.println(linea);

                } catch (Exception e) {
                    e.printStackTrace();
                }
        }
        catch(Exception e){
            e.printStackTrace();
        }finally{
            // En el finally cerramos el fichero, para asegurarnos
            // que se cierra tanto si todo va bien como si salta
            // una excepcion.
            try{
                if( null != fr ){
                    fr.close();
                }
                if (null != fichero)
                    fichero.close();
            }catch (Exception e2){
                e2.printStackTrace();
            }
            finally{
                System.out.println("{ \"file\": \"resultado.json\" }");

            }
        }



    }
}