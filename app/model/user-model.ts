import { randomUUID } from "crypto";
import { User } from "../types/types";

class UserModel {
    public id: string;
    public name: string;
    public email: string;
    public password: string;
    public entity: string

    constructor(
      id?: string,
      name?: string,
      email?: string,
      password?: string
    ) {
      this.id = id || randomUUID();
      this.name = name || "";
      this.email = email || '';
      this.password = password || '';
      this.entity = "USER"
    }

    get pk() {
      return `${this.entity}#${this.id}`;
    }
  
    get sk() {
      return `${this.entity}#${this.id}`;
    }
    
    get data(): User {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
        password: this.password
      }
    }
  
    toItem(): Record<string, unknown> {
      return {
        PK: this.pk,
        SK: this.sk,
        data: this.data,
        entity: this.entity
      };
    }
  
   static fromItem(item: any) {
      if (!item || !item.data) {
        throw new Error(`❌ Invalid item received: ${item}`);
      }
      const {name, id, email, password } = item.data as User;
      return new UserModel(id, name, email, password);
    }
  
  }
export {UserModel}