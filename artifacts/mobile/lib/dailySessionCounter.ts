/**
 * Mobile binding of the shared daily-session counter — uses AsyncStorage
 * so the Free-plan "1 Today's Practice per day" cap roundtrips across
 * app restarts.
 */
import { createDailySessionCounter } from "@workspace/learning-coach";

import { asyncStorageKv } from "./asyncStorageKv";

export const dailySessionCounter = createDailySessionCounter(asyncStorageKv);
