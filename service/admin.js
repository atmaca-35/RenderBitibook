import { Admin } from "../model/admin.js";

import bcrypt from "bcrypt";

export async function isAdmin(username, password) {
  const possibleUser = await Admin.findOne({ username });

  if (!possibleUser) {
    return false;
  }

  const match = await bcrypt.compare(password, possibleUser.password);

  return match;
}
