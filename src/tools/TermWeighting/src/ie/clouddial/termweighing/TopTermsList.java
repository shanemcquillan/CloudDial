package ie.clouddial.termweighing;

import java.util.ArrayList;

public class TopTermsList extends ArrayList<TopTerm> {
	
	public String toJSON() {
		String prefix = "{\"topterms\":[";
		for(int i = 0; i < this.size(); i++) {
			prefix+=(this.get(i).toJSON()+",");
		}
		return prefix.substring(0, prefix.length()-1) + "]}";
	}
	
}
