const catchAsync = require("../util/catchAsync")
const AppErorr = require('./../util/appError')
const APIFeatures = require('./../util/apiFeatures')


exports.deleteOne = Model => catchAsync(async (req, res, next) =>{
    const doc = await Model.findByIdAndDelete(req.params.id)

    if(!doc){
        return next(new AppErorr('no documend found', 404))
     }



    res.status(204).json({
        status: 'success',
        data: null,
    })
})


exports.updateOne = (Model, options = {}) => catchAsync(async (req, res, next) => {
    console.log(req.body)
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true 
    });

    if (!doc) {
        return next(new AppErorr('No document found', 404)); 
    }



    if (options.notify && typeof options.notify === 'function') {
        try {
            await options.notify(doc, req, res);
        } catch (error) {
            return next(error); 
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});


exports.createOne = Model => catchAsync(async (req, res, next) =>{
    

    const doc = await Model.create(req.body)


    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        }
    })
})

exports.getOne = (Model, popOptions) => catchAsync(async(req,res, next) =>{
    let query = Model.findById(req.params.id).lean()
    if(popOptions) query = query.populate(popOptions)
    const doc = await query
    if(!doc){
       return next(new AppErorr('no document found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
          data: doc
        }
    })

})



exports.getAll = (Model, searchFields = []) =>
    catchAsync(async (req, res, next) => {
      // Create the query pipeline for filtering
      const features = new APIFeatures(Model.find().lean(), req.query, searchFields)
        .filter()
        .sort()
        .search()
        .limitFields();
  
      // Count documents after applying filters (but before pagination)
      const filteredQuery = features.query.clone(); // Clone the query to avoid side effects
      const totalDocuments = await filteredQuery.countDocuments();
  
      // Apply pagination to the query
      features.paginate();
      const doc = await features.query;
  
      // Calculate total pages based on filtered totalDocuments and limit
      const limit = req.query.limit * 1 || 100;
      const totalPages = Math.ceil(totalDocuments / limit);
      const currentPage = req.query.page * 1 || 1;
  
      // SEND RESPONSE
      res.status(200).json({
        status: 'success',
        results: doc.length,
        pagination: {
          currentPage,
          totalPages,
          totalDocuments, // Corrected to reflect filtered count
        },
        data: {
          data: doc,
        },
      });
    });
  




  