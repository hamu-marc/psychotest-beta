ls -1 | gawk 'BEGIN { print "[" } { print "{\"name\":\""$0"\",\"_id\":\""$0"\"}," } END { print "{}]" }' > index.json
