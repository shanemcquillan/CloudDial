

public class TopTerm implements Comparable<TopTerm> {
	
	private String term;
	private int freq;

	public TopTerm(String term, int freq) {
		this.term = term;
		this.freq = freq;
	}

	@Override
	public int compareTo(TopTerm other) {
		if(this.freq < other.freq) return 1;
		if(this.freq > other.freq) return -1;
		return 0;
	}
	
	@Override
	public String toString() {
		return term + ": " + freq;
	}
	
	public String getTerm() {
		return term;
	}

	public void setTerm(String term) {
		this.term = term;
	}

	public int getFreq() {
		return freq;
	}

	public void setFreq(int freq) {
		this.freq = freq;
	}
	
	public String toJSON() {
		return
			"{" +
				"\"term\": " + "\"" + this.term + "\"," +
				"\"frequency\": " + "\"" + this.freq + "\"" +
			"}";
	}
	
}
