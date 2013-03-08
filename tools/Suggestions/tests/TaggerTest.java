
import java.io.IOException;

import junit.framework.TestCase;

import org.junit.Before;
import org.junit.Test;



public class TaggerTest extends TestCase {
	
	private TagSuggestor tagger;

	@Before
	public void setUp() throws Exception {
		this.tagger = new TagSuggestor("stopwords.txt");
	}
	
	@Test
	public void testTaggingContent() throws IOException {
		TopTermsList tags = tagger.suggest(
				"Cloud Dial is a web application that allows users to store, manage, retrieve and share their bookmarks anywhere, any time, straight from their browser. This system aims to be central to a users' web browsing. It should be the first thing they see when they open their browser, a new tab, or new window. Doing so they can seamlessly access their favourite sites and collected bookmarks, greatly improving productivity. In Cloud Dial each bookmark will be identifiable by an image. This will make it visually appealing and extremely practical to use in this way, especially on mobile devices."
				+ "Identifying bookmarks further will be made possible by means of textual tags, content summarisation, and categorisation into groups and sub-groups; all of which will be suggested by Cloud Dial. This rich variety of information will ensure efficient browsing, and effective bookmark retrieval."
				+ "It is hoped this system will be used by all web browser users, but more specifically, by those who bookmark regularly. An ideal user bookmarks on several different devices, bookmarking pages of various topics. For people who bookmark a lot, and need to retrieve specific bookmarks on many devices, Cloud Dial is the perfect solution.",
				"",
				10
			);
		
		String [] expectedTags = {"will", "bookmarks", "bookmark", "cloud", "dial", "browser", "users", "web", "browsing", "devices"};
		
		for(int i = 0; i < 10; i++) {
			assertTrue(tags.get(i).getTerm().equals(expectedTags[i]));
		}
		assertTrue(tags.size() == 10);
	}
	
	@Test
	public void testShortContent() throws IOException {
		TopTermsList tags = tagger.suggest(
				"Cloud Dial allows users to store bookmarks, manage them, and retrieve and share these bookmarks anywhere.",
				"",
				10
			);
		
		assertTrue(tags.size() < 10);
		assertTrue(tags.get(0).getTerm().equals("bookmarks"));
	}
	
	@Test
	public void testNothing() throws IOException {
		TopTermsList tags = tagger.suggest("", "", 10);
		assertTrue(tags.size() == 0);
	}

}
