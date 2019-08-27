import cornerstone from 'cornerstone-core';

export default function(element) {
  // Get the Cornerstone imageId
  const enabledElement = cornerstone.getEnabledElement(element);
  const imageId = enabledElement.image.imageId;

  // Get studyInstanceUid & patientId
  const study = cornerstone.metaData.get('study', imageId);
  const studyInstanceUid = study.studyInstanceUid;
  const patientId = study.patientId;

  // Get seriesInstanceUid
  const series = cornerstone.metaData.get('series', imageId);
  const seriesInstanceUid = series.seriesInstanceUid;
  const numImages = series.numImages;

  // Get sopInstanceUid
  const sopInstance = cornerstone.metaData.get('instance', imageId);
  const sopInstanceUid = sopInstance.sopInstanceUid;
  const frameIndex = sopInstance.instanceNumber || 0;

  const imagePath = [
    studyInstanceUid,
    seriesInstanceUid,
    sopInstanceUid,
    frameIndex,
    numImages,
  ].join('_');

  return {
    patientId,
    studyInstanceUid,
    seriesInstanceUid,
    sopInstanceUid,
    frameIndex,
    imagePath,
    numImages,
  };
}
