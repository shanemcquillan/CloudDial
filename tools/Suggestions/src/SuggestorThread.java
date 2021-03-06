import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;


public class SuggestorThread extends Thread {
	
	private Socket socket = null;
	private OutputStream socketOut = null;
	private InputStream socketIn = null;
		
	public SuggestorThread(Socket socket) {
	  	this.socket = socket;
	}
	  
	public void run() {
	    try {
			socketOut = socket.getOutputStream();					
			socketIn = socket.getInputStream();
			
			byte [] encodedBytes = read();
			String doc = new String(encodedBytes, "UTF-8");
			
			JSONObject titleAndBody = new JSONObject(doc);
			String title = titleAndBody.getString("title");
			String body = titleAndBody.getString("body");
			
			Summariser summariser = new Summariser();
			String summary = summariser.summarise(body, title, 1);
			
			TagSuggestor tagSugg = new TagSuggestor("stopwords.txt");
			TopTermsList tags = tagSugg.suggest(body, title, 10);
			
			JSONStringer stringer = new JSONStringer();
			stringer.object();
			stringer.key("summary");
			stringer.value(summary);
			stringer.endObject();
			String jsonSummary = stringer.toString();
			jsonSummary = jsonSummary.substring(1, jsonSummary.length()-1);
			
			stringer = new JSONStringer();
			stringer.object();
			stringer.key("tags");
			stringer.array();
			for(TopTerm tag : tags) {
				stringer.object();
				stringer.key("tag");
				stringer.value(tag.getTerm());
				stringer.key("amount");
				stringer.value(tag.getFreq());
				stringer.endObject();
			}
			stringer.endArray();
			stringer.endObject();
			String jsonTags = stringer.toString();
			jsonTags = jsonTags.substring(1, jsonTags.length()-1);
			
			String output = "{" + jsonSummary + "," + jsonTags + "}";
			System.out.println(output);
			socketOut.write(output.getBytes());
			
			socketOut.close();
			socket.close();
		} catch (IOException e) {
			System.err.println(e.toString());
		} catch (JSONException e) {
			System.err.println(e.toString());
		}
	}
	
	private byte[] read() throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		byte [] buf = new byte[1024];
	  	int len;
		while(true) {
			len = socketIn.read(buf);
		  	if(len == -1)
		  		break;
		  	baos.write(buf,0,len);
		}
		return baos.toByteArray();
	}
	
}
