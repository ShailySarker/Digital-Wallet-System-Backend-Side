import { Query } from "mongoose";
import { excludeField } from "../../constants";

// export class QueryBuilder<T> {
//   public modelQuery: Query<T[], T>;
//   public readonly query: Record<string, string>;

//   constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
//     this.modelQuery = modelQuery;
//     this.query = query;
//   }

//   filter(): this {
//     const filter = { ...this.query };

//     for (const field of excludeField) {
//       // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//       delete filter[field];
//     }

//     this.modelQuery = this.modelQuery.find(filter);

//     return this;
//   }

//   search(searchableField: string[]): this {
//     const searchTerm = this.query.searchTerm || "";
//     const searchQuery = {
//       $or: searchableField.map((field) => ({
//         [field]: { $regex: searchTerm, $options: "i" },
//       })),
//     };
//     this.modelQuery = this.modelQuery.find(searchQuery);
//     return this;
//   }

//   sort(): this {
//     const sort = this.query.sort || "-createdAt";

//     this.modelQuery = this.modelQuery.sort(sort);

//     return this;
//   }
//   fields(): this {
//     const fields = this.query.fields?.split(",").join(" ") || "";

//     this.modelQuery = this.modelQuery.select(fields);

//     return this;
//   }
//   paginate(): this {
//     const page = Number(this.query.page) || 1;
//     const limit = Number(this.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     this.modelQuery = this.modelQuery.skip(skip).limit(limit);

//     return this;
//   }

//   build() {
//     return this.modelQuery;
//   }

//   async getMeta() {
//     const totalDocuments = await this.modelQuery.model.countDocuments();

//     const page = Number(this.query.page) || 1;
//     const limit = Number(this.query.limit) || 10;

//     const totalPage = Math.ceil(totalDocuments / limit);

//     return { page, limit, total: totalDocuments, totalPage };
//   }
// }

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string> = {}) {
    // Add default value
    this.modelQuery = modelQuery;
    this.query = query || {}; // Ensure query is never undefined
  }

  filter(): this {
    const filter = { ...this.query };

    for (const field of excludeField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    this.modelQuery = this.modelQuery.find(filter);
    return this;
  }

  search(searchableField: string[]): this {
    const searchTerm = this.query?.searchTerm || ""; // Use optional chaining

    if (searchTerm) {
      const searchQuery = {
        $or: searchableField.map((field) => ({
          [field]: { $regex: searchTerm, $options: "i" },
        })),
      };

      // Merge with existing filters
      const currentFilter = this.modelQuery.getFilter();
      this.modelQuery = this.modelQuery.find({
        ...currentFilter,
        ...searchQuery,
      });
    }

    return this;
  }

  sort(): this {
    const sort = this.query?.sort || "-createdAt"; // Use optional chaining
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  fields(): this {
    const fields = this.query?.fields?.split(",").join(" ") || ""; // Use optional chaining
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  paginate(): this {
    const page = Number(this.query?.page) || 1; // Use optional chaining
    const limit = Number(this.query?.limit) || 10; // Use optional chaining
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    // Create a copy of the current query without pagination
    const countQuery = this.modelQuery.model.find(this.modelQuery.getFilter());
    const totalDocuments = await countQuery.countDocuments();

    const page = Number(this.query?.page) || 1; // Use optional chaining
    const limit = Number(this.query?.limit) || 10; // Use optional chaining
    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
