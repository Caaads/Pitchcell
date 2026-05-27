import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { Opportunity } from "./types";

/**
 * Triggers AI generation via our server key-hidden API, returns the structured report.
 */
export async function generateAIOpportunity(
  thoughts: string, 
  isPremium: boolean
): Promise<Partial<Opportunity>> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ thoughts, isPremium }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to analyze thoughts. Model has high workload or API key limit reached.");
  }

  return await response.json();
}

/**
 * Saves generated opportunity to Firestore (or local storage).
 */
export async function saveOpportunityToDatabase(
  opportunity: Opportunity,
  isPlayground: boolean
): Promise<void> {
  if (isPlayground) {
    const saved = localStorage.getItem("pitchcell_opportunities");
    const list: Opportunity[] = saved ? JSON.parse(saved) : [];
    list.unshift(opportunity);
    localStorage.setItem("pitchcell_opportunities", JSON.stringify(list));
    return;
  }

  const path = `opportunities/${opportunity.id}`;
  try {
    await setDoc(doc(db, "opportunities", opportunity.id), opportunity);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches the user's generation history.
 */
export async function fetchUserOpportunities(
  userId: string,
  isPlayground: boolean
): Promise<Opportunity[]> {
  if (isPlayground) {
    const saved = localStorage.getItem("pitchcell_opportunities");
    const list: Opportunity[] = saved ? JSON.parse(saved) : [];
    return list.filter(item => item.userId === userId);
  }

  const path = "opportunities";
  try {
    const q = query(
      collection(db, "opportunities"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const results: Opportunity[] = [];
    snap.forEach((doc) => {
      results.push(doc.data() as Opportunity);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Toggles the saved status of an opportunity report.
 */
export async function updateOpportunitySaveState(
  opportunityId: string,
  isSaved: boolean,
  isPlayground: boolean
): Promise<void> {
  if (isPlayground) {
    const saved = localStorage.getItem("pitchcell_opportunities");
    const list: Opportunity[] = saved ? JSON.parse(saved) : [];
    const item = list.find(o => o.id === opportunityId);
    if (item) {
      item.isSaved = isSaved;
      localStorage.setItem("pitchcell_opportunities", JSON.stringify(list));
    }
    return;
  }

  const path = `opportunities/${opportunityId}`;
  try {
    await updateDoc(doc(db, "opportunities", opportunityId), { isSaved });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates any attributes of an opportunity report (e.g. title, problem, solution, etc.).
 */
export async function updateOpportunityInDatabase(
  opportunityId: string,
  updatedFields: Partial<Opportunity>,
  isPlayground: boolean
): Promise<void> {
  if (isPlayground) {
    const saved = localStorage.getItem("pitchcell_opportunities");
    const list: Opportunity[] = saved ? JSON.parse(saved) : [];
    const index = list.findIndex(o => o.id === opportunityId);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      localStorage.setItem("pitchcell_opportunities", JSON.stringify(list));
    }
    return;
  }

  const path = `opportunities/${opportunityId}`;
  try {
    await updateDoc(doc(db, "opportunities", opportunityId), updatedFields);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes an opportunity from history.
 */
export async function deleteOpportunityFromDatabase(
  opportunityId: string,
  isPlayground: boolean
): Promise<void> {
  if (isPlayground) {
    const saved = localStorage.getItem("pitchcell_opportunities");
    const list: Opportunity[] = saved ? JSON.parse(saved) : [];
    const filtered = list.filter(o => o.id !== opportunityId);
    localStorage.setItem("pitchcell_opportunities", JSON.stringify(filtered));
    return;
  }

  const path = `opportunities/${opportunityId}`;
  try {
    await deleteDoc(doc(db, "opportunities", opportunityId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
