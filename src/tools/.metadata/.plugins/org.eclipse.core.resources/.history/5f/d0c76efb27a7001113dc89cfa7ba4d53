import java.io.File;
import java.io.IOException;
import java.util.Collections;

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


public class TagSuggestor {
	
	private Directory index;
	private IndexWriterConfig config;
	
	public TagSuggestor(String stopwords) throws IOException {
		File sws = new File(stopwords);
		StandardAnalyzer analyzer = new StandardAnalyzer(Version.LUCENE_35, sws);
		this.config = new IndexWriterConfig(Version.LUCENE_35, analyzer);
		this.index = new RAMDirectory();
	}

	public TopTermsList suggest(String text, int amount) throws IOException {
		Document doc = new Document();
		doc.add(new Field("title", text, Field.Store.YES, Field.Index.ANALYZED, TermVector.YES));
		IndexWriter writer = new IndexWriter(index, config);
		writer.addDocument(doc);
		writer.close();

		IndexReader reader = IndexReader.open(index);
		TermFreqVector [] vectors = reader.getTermFreqVectors(0);
		TopTermsList top = new TopTermsList();
		if(vectors != null) {
			TermFreqVector vect = vectors[0];
			String [] terms = vect.getTerms();
			int [] freqs = vect.getTermFrequencies();
			TopTermsList termlist = new TopTermsList();
			for(int i = 0; i < terms.length; i++) {
			  TopTerm t = new TopTerm(terms[i], freqs[i]);
			  termlist.add(t);
			}
			
			//Sort and take top
			Collections.sort(termlist);
			int numTop = amount > termlist.size() ? termlist.size() : amount;
			for(int i = 0; i < numTop; i++) {
				top.add(termlist.get(i));
			}
		}
		
		reader.close();
		
		return top;
	}

}
