import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class ContextStorage {
  private context: any = {};

  setContext(key: string, value: any) {
    this.context[key] = value;
  }

  getContext(key: string) {
    return this.context[key];
  }
}