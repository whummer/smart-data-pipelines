/////
// Utility function for reading CloudFoundry VCAP_SERVICES
/////
'use strict';

function read_mongodb_url_from_vcap_services() {
  try {
    if (process.env.VCAP_SERVICES) {
      console.log("Read MongoDB connection string from CF VCAP_SERVICES ...")
      var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
      console.log(JSON.stringify(vcap_services));
      var mongo_url = vcap_services["mongodb-2.0"][0].credentials.url;
      console.log(JSON.stringify(mongo_url));
      return mongo_url;     
    } else {
      console.log("No CloudFoundry VCAP_SERVICES defined ...");
    }
  } catch (err) {
    console.log("An error occurred while loading the MongoDB credentials from the env:", err)
    console.log("Please ensure that you have bound a MongoDB service instance to the application!")
  }
}

module.exports = {
	CLOUDFOUNDRY_MONGODB_DB_URL: read_mongodb_url_from_vcap_services()
}