import { initializeApp } from "firebase/app";
import { addDoc } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore/lite";

const firebaseConfig = {
    apiKey: "AIzaSyDVIvkrPwW76arrnIUjsGN1-jcBlfbHpWA",
    authDomain: "realestateclub-584d7.firebaseapp.com",
    projectId: "realestateclub-584d7",
    storageBucket: "realestateclub-584d7.appspot.com",
    messagingSenderId: "457631501672",
    appId: "1:457631501672:web:df25a3429bb68aecc31add",
    measurementId: "G-90QFHNY9H8"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Get a list of userProfiles from databse
async function getUsers() {
  const userProfileCollection = collection(db, "userProfile");
  const userProfileDocuments = await getDocs(userProfileCollection);
  const userList = [];

  userProfileDocuments.docs.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    userList.push(data);
  });
  return userList;
}

// function to update firebase docs
async function updateUserData(id, data) {
  console.log(id);
  console.log(data);
  const userInfo = doc(db, "userProfile", id);
  await updateDoc(userInfo, data);
}

async function addNewProfile(data) {
  const userProfileCollection = collection(db, "userProfile");
  const docRef = await addDoc(userProfileCollection, data);
  return docRef.id; // returns the new document reference ID
}

export { getUsers, db, updateUserData, addNewProfile, storage };