from algoliasearch.search_client import SearchClient
from algoliasearch.account_client import AccountClient

# Copy from SRC to DST
src_index = SearchClient.create('X5610KET2K', '1dcfc4ee43ef0de65c93ea661524a425').init_index('locality_prod')
dst_index = SearchClient.create('HJ20MIEM9K', '8224a01c8bda9a91a33cfb6c2abf0a47').init_index('dummy')
AccountClient.copy_index(src_index, dst_index)#, { 'scope': ['settings', 'synonyms'] })
