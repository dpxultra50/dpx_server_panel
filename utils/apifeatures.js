class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page);

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }

  statusFilter() {
    const keyword = this.queryStr.keyword
      ? {
          status: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }
}

module.exports = ApiFeatures;
