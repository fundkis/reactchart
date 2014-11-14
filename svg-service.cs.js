// var m = {};
// //	m.style = {};
// //TODO Remarque Hicham
// // mois je ferais 3 méthode: toCx(), toCy() et toC(). les trois prennent un dataSpace (voir plus bas), le premier et le second juste une valeur. le troisième un object de ce style { x : 2, y : 3 }
// //	m.toCx = function(force,val){
// //	};
// //	m.toCy = function(force,val)
//
// var dataDistance = function (d1, d2) {
//   return d2 - d1;
// };
//
// var id = 0;
//
// m.dataSpaceMgr = function (dataSpace) {
//   //Normaliser => rendre la même structure. Substituer les racourcies
//   var normDS = m.normalizeDataSpace(dataSpace);
//   var normC = normDS.c;
//   var normD = normDS.d;
//   //Adjust => passer tout en absolue
//   var cTotalXYRange = {
//     x: adjustRange(normC, 'x', dataSpace.outerSize.width),
//     y: adjustRange(normC, 'y', dataSpace.outerSize.height)
//   };
//   var dTotalXYRange = {
//     x: adjustRange(normD, 'x', dataSpace.outerSize.width),
//     y: adjustRange(normD, 'y', dataSpace.outerSize.height)
//   };
//   //Padding => le nouveau interval après padding.
//   var cXYRange = {
//     x: applyPadding(normC, 'x', cTotalXYRange.x),
//     y: applyPadding(normC, 'y', cTotalXYRange.y)
//   };
//   var dXYRange = {
//     x: applyPadding(normD, 'x', dTotalXYRange.x),
//     y: applyPadding(normD, 'y', dTotalXYRange.y)
//   };
//   return {
//     id: id++,
//     normalized: function () {
//       return normDS;
//     },
//     cTotalXYRange: function () {
//       return cTotalXYRange;
//     },
//     dTotalXYRange: function () {
//       return dTotalXYRange;
//     },
//     cXYRange: function () {
//       return cXYRange;
//     },
//     dXYRange: function () {
//       return dXYRange;
//     },
//     toCx: function (val) {
//       var crange = cXYRange.x;
//       var drange = dXYRange.x;
//       var rc = crange.min + ((crange.max - crange.min) * dataDistance(drange.min, val) / dataDistance(drange.min, drange.max));
//       //$log.debug('data ' + val + ' for ' + JSON.stringify(dataSpace.d.x) + ' gives CX = ' + rc);
//       if (rc < crange.min || rc > crange.max) {
//         $log.warn('data ' + val + ' is outside ' + JSON.stringify(dataSpace.d.x) + ' which gives CX = ' + rc);
//       }
//       return rc;
//     },
//     toCy: function (val) {
//       var crange = cXYRange.y;
//       var drange = dXYRange.y;
//       var rc = crange.max - ((crange.max - crange.min) * dataDistance(drange.min, val) / dataDistance(drange.min, drange.max));
//       //$log.debug('data ' + val + ' for ' + JSON.stringify(dataSpace.d.y) + ' gives CY = ' + rc);
//       if (rc < crange.min || rc > crange.max) {
//         $log.warn('data ' + val + ' is outside ' + JSON.stringify(dataSpace.d.y) + ' which gives CY = ' + rc);
//       }
//       return rc;
//     },
//     toR: function (val) {
//       return val;
//     }
//   };
// };
//
// m.normalizeDataSpace = function (dataSpace) {
//   return {
//     c: normalize(dataSpace.c, 'relative'),
//     d: normalize(dataSpace.d, 'absolute')
//   };
// };
// var normalize = function (cOrD, defaultType) {
//   var c = _.copy(cOrD);
//   if (!c.x) c.x = {};
//   if (!c.y) c.y = {};
//   if (!c.x.type) c.x.type = c.type || defaultType;
//   if (!c.y.type) c.y.type = c.type || defaultType;
//   if (c.padding) {
//     if (c.padding.x) {
//       if (typeof c.padding.x !== 'object') c.padding.x = {
//         value: c.padding.x
//       };
//       if (!c.padding.x.type) c.padding.x.type = c.padding.type || (c.type || defaultType);
//     }
//     if (c.padding.y) {
//       if (typeof c.padding.y !== 'object') c.padding.y = {
//         value: c.padding.y
//       };
//       if (!c.padding.y.type) c.padding.y.type = c.padding.type || (c.type || defaultType);
//     }
//   }
//   return c;
// };
// var adjustRange = function (normalizedSpace, dim, outerSize) {
//   var crange = normalizedSpace[dim];
//   if (crange.type !== "absolute") {
//     crange = {
//       min: crange.min * outerSize / 100,
//       max: crange.max * outerSize / 100,
//       step: crange.step
//     };
//   }
//   return crange;
// };
// var applyPadding = function (normalizedSpace, dim, crange) {
//   if (normalizedSpace.padding) {
//     var padding = normalizedSpace.padding[dim];
//     if (padding && padding.value) {
//       if (padding.type === "absolute") {
//         return {
//           min: crange.min + padding.value,
//           max: crange.max - padding.value,
//           step: crange.step
//         };
//       } else {
//         return {
//           min: crange.min + padding.value * (crange.max - crange.min) / 100,
//           max: crange.max - padding.value * (crange.max - crange.min) / 100,
//           step: crange.step
//         };
//       }
//     }
//   }
//   return crange;
// };
//
// module.exports = m;
