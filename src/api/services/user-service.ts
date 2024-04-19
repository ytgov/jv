import knex, { Knex } from "knex";
import { DB_CONFIG, DB_SCHEMA } from "../config";
import _, { map } from "lodash";
import axios from "axios";
import { timeStamp } from "console";
export class UserService {
  private db: Knex;

  constructor() {
    this.db = knex(DB_CONFIG);
  }

  async create(email: string, first_name: string, last_name: string, roles: string, is_active: string): Promise<any> {
    let existing = await this.db("user").withSchema(DB_SCHEMA).where({ email }).count("email as cnt");

    if (existing[0].cnt > 0) return undefined;

    let user = {
      email,
      first_name,
      last_name,
      roles,
      is_active,
      status: "Active",
      create_date: new Date(),
    };

    return await this.db("user").withSchema(DB_SCHEMA).insert(user);
  }

  async update(email: string, item: any) {
    return this.db("user").withSchema(DB_SCHEMA).where({ email }).update(item);
  }

  async createOrUpdate(user_info: any): Promise<any> {
    const email = user_info.email;
    const existing = await this.db("user").withSchema(DB_SCHEMA).where({ email }).count("email as cnt");

    delete user_info.email_verified;

    if (existing[0].cnt > 1) return undefined;
    else if (existing[0].cnt == 1) {
      delete user_info.display_name;
      delete user_info.last_name;
      delete user_info.first_name;
      delete user_info.status;
      delete user_info.roles;

      user_info.status = "Active";

      return await this.db("user").withSchema(DB_SCHEMA).where({ email }).update(user_info);
    } else {
      user_info.roles = user_info.roles.join(",");
      user_info.create_date = new Date();
      return await this.db("user").withSchema(DB_SCHEMA).insert(user_info);
    }
  }

  async getAll() {
    return this.db("user").withSchema(DB_SCHEMA);
  }

  async getByEmail(email: string): Promise<any | undefined> {
    return await this.db("user").withSchema(DB_SCHEMA).where({ email }).first();
  }

  async getById(id: string): Promise<any | undefined> {
    return this.db("user").withSchema(DB_SCHEMA).where({ id }).first();
  }

  async getAccessFor(email: string): Promise<string[]> {
    return this.db("user").withSchema(DB_SCHEMA).where({ email }).select("roles");
  }

  async setAccess(email: string, access: string[]) {
    return this.db("user").withSchema(DB_SCHEMA).where({ email }).update({ roles: access });
  }

  async getDepartmentAccess(id: string): Promise<number[]> {
    return this.db("departmentassignments").withSchema(DB_SCHEMA).where("userid", "=", id).select("*");
  }

  async saveDepartmentAccess(id: string, access: number[]) {
    await this.db("departmentassignments").withSchema(DB_SCHEMA).where("userid", "=", id).del();
    if (access) {
      const fieldsToInsert = access.map((entry) => ({
        userid: id,
        objectid: entry,
      }));
      return this.db("departmentassignments").withSchema(DB_SCHEMA).insert(fieldsToInsert);
    }
  }

  async getRoleAccess(id: string): Promise<number[]> {
    return this.db("roleassignments").withSchema(DB_SCHEMA).where("userid", "=", id).select("*");
  }

  async saveRoleAccess(id: string, access: number[]) {
    await this.db("roleassignments").withSchema(DB_SCHEMA).where("userid", "=", id).del();
    if (access) {
      const fieldsToInsert = access.map((entry) => ({
        userid: id,
        roleid: entry,
      }));
      return this.db("roleassignments").withSchema(DB_SCHEMA).insert(fieldsToInsert);
    }
  }

  async getUnit(email: string) {
    let unitSearch = await axios
      .get(`http://directory-api-dev.ynet.gov.yk.ca/employees`)
      .then((resp: any) => {
        let match = resp.data.employees.filter((user: any) => {
          return user.email == email;
        });
        return match[0];
      })
      .catch((e: Error) => {
        console.log(e);
      });

    let unit = {
      department: unitSearch.department,
      division: unitSearch.division,
      branch: unitSearch.branch,
      unit: unitSearch.unit,
      mailcode: unitSearch.mailcode,
      manager: unitSearch.manager,
    };

    return unit;
  }

  async makeDTO(userRaw: any) {
    let dto = userRaw;
    dto.display_name = `${userRaw.first_name} ${userRaw.last_name}`;
    dto.roles = _.split(userRaw.roles, ",").filter((r: string) => r.length > 0);
    dto.manage_mailcodes = _.split(userRaw.manage_mailcodes, ",").filter((r: string) => r.length > 0);
    //dto.access = await this.db.getAccessFor(userRaw.email);
    //dto.display_access = _.join(dto.access.map((a: any) => a.level), ", ")

    return dto;
  }

  isConnected(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db
        .raw("SELECT 'Connected' as [working]")
        .then((data: Array<any>) => {
          if (data && data.length == 1) {
            resolve(data[0].working === "Connected");
          }

          resolve(false);
        })
        .catch((err: Error) => {
          console.error(err);
          resolve(false);
        });
    });
  }
}
