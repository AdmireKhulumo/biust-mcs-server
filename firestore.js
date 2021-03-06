var admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

exports.db = db;
