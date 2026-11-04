import type { Dictionary } from "../../translate";
import { common } from "./common";
import { vocabulary } from "./vocabulary";
import { skills } from "./skills";
import { account } from "./account";
import { landing } from "./landing";

/** Vietnamese translations. Keys are the English source strings used in the UI. */
export const vi: Dictionary = { ...common, ...vocabulary, ...skills, ...account, ...landing };
