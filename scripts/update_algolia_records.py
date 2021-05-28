import os
from algoliasearch.search_client import SearchClient

# Get environment variables
ALGOLIASEARCH_API_KEY = os.getenv('ALGOLIASEARCH_API_KEY')
ALGOLIASEARCH_APPLICATION_ID = os.getenv('ALGOLIASEARCH_APPLICATION_ID')
ALGOLIASEARCH_INDEX = os.environ.get('ALGOLIASEARCH_INDEX')

# Check all environment variables are set correctly
if not ALGOLIASEARCH_API_KEY:
    print("ALGOLIASEARCH_API_KEY not set")
    exit(-1)

if not ALGOLIASEARCH_APPLICATION_ID:
    print("ALGOLIASEARCH_APPLICATION_ID not set")
    exit(-1)

if not ALGOLIASEARCH_INDEX:
    print("ALGOLIASEARCH_INDEX not set")
    exit(-1)

print("ALGOLIASEARCH_API_KEY={}".format(ALGOLIASEARCH_API_KEY))
print("ALGOLIASEARCH_APPLICATION_ID={}".format(ALGOLIASEARCH_APPLICATION_ID))
print("ALGOLIASEARCH_INDEX={}".format(ALGOLIASEARCH_INDEX))

# Connecting to index
print("Connecting to Algolia index...")
client = SearchClient.create(ALGOLIASEARCH_APPLICATION_ID, ALGOLIASEARCH_API_KEY)
index = client.init_index(ALGOLIASEARCH_INDEX)
print("Connected to Algolia index")

# Make sure the index exists
if not index.exists():
    print("Index does not exist!")
    exit(-1)
	
# Empty query will match all records
print("Fetching documents...")
query = 'Locality' 
res = index.browse_objects({'query': query})
print("Documents fetched!")

print("Updating documents...")
hits = []
for hit in res:
    # Edit hit here
    hits.append(hit)
print("Documents updated!")

# Update hits in index
print("Updating index...")
for i in range(0, len(hits), 100):
    index.save_objects(hits[i:i+100])
print("Updated index!")
