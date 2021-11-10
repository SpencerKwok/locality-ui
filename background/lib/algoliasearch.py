import os
from algoliasearch.search_client import SearchClient, SearchIndex


def get_index() -> SearchIndex:
    client = SearchClient.create(
        os.environ["ALGOLIASEARCH_APPLICATION_ID"], os.environ["ALGOLIASEARCH_API_KEY"]
    )
    index = client.init_index(os.environ["ALGOLIASEARCH_INDEX"])
    return index
