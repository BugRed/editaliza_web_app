import type { Artist } from "./Artist";
import { CommentData } from "./CommentData";
import type { Edital } from "./Edital";
import type { Proposer } from "./Proposer";
import type { TagData } from "./TagData";
import type { UserData } from "./UserData";

export type AllData = {
  userData: UserData[];
  artists: Artist[];
  proposers: Proposer[];
  editals: Edital[];
  tags: TagData[];
  comments: CommentData[];
};
