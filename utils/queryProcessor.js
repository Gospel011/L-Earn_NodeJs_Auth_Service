/**
 * @param {Object} query: this is the result of Model.find for example
 * @param {Object} queryObject: this is the object containing the clients query parameters
 * @param {Array} allowedFields: this is the array of allowed fields that'll be used to filter the query
 */
class QueryProcessor {
  constructor(query, queryObject, allowedFields = ['type', 'price']) {
    this.query = query;
    this.queryObject = queryObject;
    this.allowedFields = allowedFields;
  }

  filter() {
    let parsedQueryObject = {};

    // add $ in front of (gte|gt|lte|lt)

    Object.keys(this.queryObject).forEach((el) => {
      console.log('Current el: ', el);
      console.log(this.allowedFields.includes(el));

      if (this.allowedFields.includes(el)) {
        console.log('In');

        parsedQueryObject[el] = this.queryObject[el];
      }
    });

    parsedQueryObject = JSON.parse(
      JSON.stringify(parsedQueryObject).replace(
        /\b(gte|gt|lte|lt|in)\b/g,
        (match) => `$${match}`
      )
    );

    // { sort: '-dateCreated', tags: { in: 'resumption' } } { tags: { '$in': 'resumption' } }
    let tagsArray;
    if (parsedQueryObject.tags) {
      if (parsedQueryObject.tags['$in']) {
        tagsArray = parsedQueryObject['tags']['$in'].split(', ');
        parsedQueryObject['tags']['$in'] = tagsArray.map((el) => `#${el}`);
      }
    }

    console.log(this.queryObject, parsedQueryObject);

    //* FILTER BY TYPE
    this.query = this.query.find(parsedQueryObject);
    return this;
  }

  sort() {
    let sort = '-averageRating -dateCreated';

    //* SORT BY PRICE, DATE CREATED
    if (this.queryObject.sort) {
      sort = this.queryObject.sort.split(/,\s?/).join(' ');

      console.log(`Sort string = ${sort}`);
    }
    this.query = this.query.sort(sort);
    return this;
  }

  select() {
    let fields = '-__v';

    if (this.queryObject.fields) {
      console.log('Fields in query object');
      fields = this.queryObject.fields.split(', ').join(' ');
    }
    this.query = this.query.select(fields);
    return this;
  }

  paginate() {
    let page = this.queryObject.page * 1 || 1;
    let limit = this.queryObject.limit * 1 || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = QueryProcessor;
