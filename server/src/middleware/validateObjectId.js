// A MongoDB ObjectId is and should be exactly 24 hex characters.

//ask

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export function isObjectId(value){
    return typeof value === 'string' && OBJECT_ID.test(value);
}


// to be called for every route in the router with :id in its path
export function validateObjectIdParam(req, res, next, value){
    if (!isObjectId(value)){
        return res.status(400).json({ error: 'Invalid id' });
    }
    next();
}