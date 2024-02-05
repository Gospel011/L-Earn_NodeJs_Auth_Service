/**
 * When a resourse is deleted, this controller should be called to update other resources linked to it
 */
exports.updateIds = async (req, res, next) => {
  //* contentQuery, targetField, idToDelete
  const contentQuery = req.contentQuery;
  const targetField = req.targetField;
  const idToDelete = req.idToDelete;

  // if (type == 'book') {
  const content = await contentQuery;
  console.log({ content, targetField, idToDelete });

  if (!content) return;
  
  const ids = content[targetField];
  console.log({ ids });
  if (!ids) return;
  const indexToDelete = ids.indexOf(idToDelete);

  ids.splice(indexToDelete, 1);
  content.save();

  //* get all resources that have their id in the specified ids
  updatedResources = await req.model.find({ _id: { $in: ids } });
  req.updatedResources = updatedResources;

  next();
};

exports.updateChapters = async (req, res, next) => {
  const updatedChapters = req.updatedResources;

  if (!updatedChapters) return;

  let index = 0;
  updatedChapters.map((chapter) => {
    chapter.chapter = index + 1;
    chapter.save();

    index++;
  });

  next();
};
