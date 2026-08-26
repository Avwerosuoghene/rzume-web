import { Type } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

export const CoreModules: readonly Type<unknown>[] = [
  ReactiveFormsModule, FormsModule, CommonModule,
];
