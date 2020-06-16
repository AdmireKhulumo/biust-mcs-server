const { ApolloServer, gql, ApolloError } = require("apollo-server");
const { db } = require("./firestore");

//Type definitions
const typeDefs = gql`
	type Guest {
		contactPersonEmail: String
		contactPersonNames: String
		contactPersonPhoneNum: String
		dateOfRegistration: String
		email: String
		gender: String
		name: String
		officialId: String
		phoneNum: String
		physicalAdd: String
		purposeOfVisit: String
		registerByDbId: String
		registeredBy: String
		station: String
	}

	type Staff {
		name: String
		employeeId: String
		officialId: String
		email: String
		gender: String
		contactNum: String
		department: String
		office: String
		physicalAdd: String
	}

	type Student {
		name: String
		studentId: String
		officialId: String
		contactNum: String
		gender: String
		email: String
		physicalAdd: String
		incampus: String
		education: String
		programme: String
	}

	type Moderator {
		fullname: String
		gender: String
		email: String
		phone: String
		identificationNum: String
		physicalAddress: String
		registrationDate: String
	}

	type Totals {
		stationTotal: Int
		guestsTotal: Int
		studentsTotal: Int
		staffTotal: Int
	}

	type Recording {
		candidate: String
		candidateDbId: String
		dateRecorded: String
		direction: String
		recordedBy: String
		recordedByDbId: String
		station: String
		temperature: String
		typeOfCandidate: String
		stationTotalRecords: Int
		guest: Guest
		staff: Staff
		student: Student
		moderator: Moderator
		totals: Totals
	}

	type Station {
		id: String
		stationName: String
	}

	type Query {
		recordings(
			station: String!
			dateStart: String
			dateEnd: String
		): [Recording]
		stations: [Station]
	}
`;

//Resolvers
const resolvers = {
	//For the base queries
	Query: {
		async recordings(parent, args) {
			try {
				const options = { year: "numeric", month: "long", day: "numeric" };
				let dea = new Date(`${args.dateEnd}`).toLocaleDateString().split("/");
				console.log(`dea is ${dea}`);
				let de = new Date(`${dea[0]}/${dea[1]}/${dea[2]}`);
				console.log(`entered ${de.toLocaleDateString("en-GB", options)}`);

				const recordings = await db
					.collection("temperature_recordings")
					.where("station", "==", `${args.station}`)
					.where("dateRecorded", ">=", `${args.dateStart}`)
					.orderBy("dateRecorded", "desc")
					.get();

				let data = [];
				recordings.docs.map((recording) => {
					//console.log(`recorded ${recording.data().dateRecorded}`);
					dra = recording.data().dateRecorded.slice(0, 11).split("/");
					//console.log(`dra is ${dra}`);
					dr = new Date(`${dra[1]}/${dra[0]}/${dra[2]}`);
					console.log(`recorded ${dr.toLocaleDateString("en-GB", options)}`);
					//console.log(dr.toLocaleDateString("en-GB", options));

					let lessThan = false;

					if (de.getFullYear() > dr.getFullYear()) {
						lessThan = true;
						console.log("year");
					} else if (
						de.getFullYear() === dr.getFullYear() &&
						de.getMonth() > dr.getMonth()
					) {
						lessThan = true;
						console.log("month");
						console.log(`de month ${de.getMonth()}`);
						console.log(`dr month ${dr.getMonth()}`);
					} else if (
						de.getFullYear() === dr.getFullYear() &&
						de.getMonth() === dr.getMonth() &&
						de.getDate() >= dr.getDate()
					) {
						lessThan = true;
						console.log("day");
					}

					if (lessThan) {
						data.push({
							id: recording.id,
							candidate: recording.data().candidate,
							candidateDbId: recording.data().candidateDbId,
							dateRecorded: recording.data().dateRecorded,
							direction: recording.data().direction,
							recordedBy: recording.data().recordedBy,
							recordedByDbId: recording.data().recordedByDbId,
							station: recording.data().station,
							temperature: recording.data().temperature,
							typeOfCandidate: recording.data().typeOfCandidate,
							stationTotalRecords: recordings.size
						});
					}
				});

				return data;
			} catch (error) {
				throw new ApolloError(error);
			}
		},
		async stations() {
			try {
				const stations = await db
					.collection("stations")
					.orderBy("stationName")
					.get();

				let data = [];
				stations.docs.map((station) => {
					data.push({
						id: station.id,
						stationName: station.data().stationName
					});
				});
				return data;
			} catch (error) {
				throw new ApolloError(error);
			}
		}
	},

	Recording: {
		async guest(recordings) {
			try {
				const snapshot = await db
					.collection("guest")
					.doc(`${recordings.candidateDbId}`)
					.get();
				let guestData = snapshot.data();
				return guestData;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		async staff(recordings) {
			try {
				const snapshot = await db
					.collection("staff")
					.doc(`${recordings.candidateDbId}`)
					.get();
				let staffData = snapshot.data();
				return staffData;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		async student(recordings) {
			try {
				const snapshot = await db
					.collection("students")
					.doc(`${recordings.candidateDbId}`)
					.get();
				let studentData = snapshot.data();
				return studentData;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		async moderator(recordings) {
			try {
				const snapshot = await db
					.collection("moderator")
					.doc(`${recordings.recordedByDbId}`)
					.get();
				let moderatorData = snapshot.data();
				return moderatorData;
			} catch (error) {
				throw new ApolloError(error);
			}
		}
	}
};

//Initialising Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
	playground: true,
	introspection: true,
	cors: true
	//Add Apollo Engine Key If Desired
});

//Launching web server
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
	console.log(`🚀 Server ready at ${url}!`);
});
