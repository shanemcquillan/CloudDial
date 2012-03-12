package ie.clouddial.termweighing;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.Field.TermVector;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.TermFreqVector;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;
import org.apache.lucene.util.Version;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.Collections;

public class TopTermsThread extends Thread {
	
  private Socket socket = null;
  OutputStream socketOut = null;
  InputStream socketIn = null;
	
  public TopTermsThread(Socket socket) {
    	this.socket = socket;
  }
	
  public void run() {
    try {
	    socketOut = socket.getOutputStream();					
		// Attach a printer to the socket's output stream
	    socketIn = socket.getInputStream();
	    byte [] buffer = read();
		String doc = new String(buffer);
		// Attach a reader to the socket's input stream
    	
		// 0. Specify the analyzer for tokenizing text.
		//    The same analyzer should be used for indexing and searching
		StandardAnalyzer analyzer = new StandardAnalyzer(Version.LUCENE_35, new File("stopwords.txt"));

		// 1. create the index
		Directory index = new RAMDirectory();
		IndexWriterConfig config = new IndexWriterConfig(Version.LUCENE_35, analyzer);

		IndexWriter w = new IndexWriter(index, config);
		addDoc(w, doc);
		w.close();

		IndexReader reader = IndexReader.open(index);
		TermFreqVector vect = reader.getTermFreqVectors(0)[0];
		String [] terms = vect.getTerms();
		int [] freqs = vect.getTermFrequencies();
		TopTermsList termlist = new TopTermsList();
		for(int i = 0; i < terms.length; i++) {
		  TopTerm t = new TopTerm(terms[i], freqs[i]);
		  termlist.add(t);
		}
		Collections.sort(termlist);
		TopTermsList top10 = new TopTermsList();
		for(int i = 0; i < 10; i++) {
			top10.add(termlist.get(i));
		}
		String jsonTerms = top10.toJSON();
		System.out.println(jsonTerms);
		socketOut.write(jsonTerms.getBytes());
		
		reader.close();
	    socketOut.close();
	    socket.close();
	} catch (Exception e) {
		e.printStackTrace();
	}
  }

  private byte[] read() throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		byte [] buf = new byte[1024];
	  	int len;
		while(true) {
			len = socketIn.read(buf);
		  	baos.write(buf,0,len);
		  	if(len < 1024)
		  		break;
		}
		return baos.toByteArray();
}

private static void addDoc(IndexWriter w, String value) throws IOException {
    Document doc = new Document();
    doc.add(new Field("title", value, Field.Store.YES, Field.Index.ANALYZED, TermVector.YES));
    w.addDocument(doc);
  }
}