

import java.net.*;
import java.io.*;
import java.util.concurrent.*;


// The server
public class Server  {
	
    public static void main(String[] args) throws IOException {
        ServerSocket serverSocket = null;		// The server socket, connections arrive here
		ExecutorService pool = null;			//Thread pool

        try {
            serverSocket = new ServerSocket(8125);
			pool = Executors.newCachedThreadPool(); 
			//Creates a thread pool that creates new threads as needed, 
			//but will reuse previously constructed threads when they are available.
		} 
		catch (IOException e) {
            System.err.println("Could not listen on port: 8125");
            System.exit(-1);
        }
		
		try {
			while(true)
				pool.execute(new SuggestorThread(serverSocket.accept()));	//initialise threads in thread pool
		} 
		catch (IOException e) {
			pool.shutdown();
		}
    }
    
}