package edu.iu.uits.lms.hierarchyresourcemanager.services.swagger;

import java.util.ArrayList;
import java.util.List;

import static edu.iu.uits.lms.iuonly.IuCustomConstants.IUCUSTOM_GROUP_CODE_PATH;

public class SwaggerTestUtil {
   protected static  List<String> getEmbeddedSwaggerToolPaths(List<String> baseList) {
      List<String> expandedList = new ArrayList<>(baseList);
      expandedList.add(IUCUSTOM_GROUP_CODE_PATH);
      return expandedList;
   }
}
