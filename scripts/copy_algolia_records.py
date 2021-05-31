from algoliasearch.search_client import SearchClient
from algoliasearch.account_client import AccountClient

# Copy from SRC to DST
src_index = SearchClient.create('SRC_APP_ID', 'SRC_API_KEY').init_index('SRC_INDEX')
dst_index = SearchClient.create('DST_APP_ID', 'DST_API_KEY').init_index('DST_INDEX')
AccountClient.copy_index(src_index, dst_index)#, { 'scope': ['settings', 'synonyms'] })
