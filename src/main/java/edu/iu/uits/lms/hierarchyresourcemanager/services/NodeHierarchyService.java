package edu.iu.uits.lms.hierarchyresourcemanager.services;

import canvas.client.generated.api.AccountsApi;
import canvas.client.generated.model.Account;
import edu.iu.uits.lms.hierarchyresourcemanager.model.nodehierarchy.NodeCampus;
import edu.iu.uits.lms.hierarchyresourcemanager.model.nodehierarchy.NodeSchool;
import edu.iu.uits.lms.hierarchyresourcemanager.model.nodehierarchy.NodeWrapper;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.NodeHierarchyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by tnguyen on 2/5/16.
 */

@Service
@Slf4j
public class NodeHierarchyService {

    @Autowired
    private AccountsApi accountService;

    @Autowired
    private NodeHierarchyRepository nodeHierarchyRepository;

    public List<NodeCampus> getIuHierarchy(List<String[]> nodeHierarchyList) {

        List<NodeCampus> nodeHierarchys = new ArrayList<NodeCampus>();

        long start = System.currentTimeMillis();

        Map<String, NodeCampus> nodeCampusMap = new HashMap<String, NodeCampus>();

        Map<String, NodeSchool> nodeSchoolMap = new HashMap<String, NodeSchool>();

        if (nodeHierarchyList!=null && !nodeHierarchyList.isEmpty()) {
            for (String[] arrayList : nodeHierarchyList) {
                String account_id = arrayList[0];
                String parent_account_id = arrayList[1];

                // is it a campus?
                if ("".equals(parent_account_id)) {
                    NodeCampus nodeCampus = new NodeCampus();
                    nodeCampus.setCampus(account_id);
                    nodeCampusMap.put(account_id, nodeCampus);
                    nodeHierarchys.add(nodeCampus);
                }
                // is it a school?
                else if (account_id != null && account_id.endsWith("-GRP")) {
                    NodeCampus nodeCampus = nodeCampusMap.get(parent_account_id);

                    if (nodeCampus != null) {
                        List<NodeSchool> nodeSchoolList = nodeCampus.getSchools();
                        if (nodeSchoolList == null) {
                            nodeSchoolList = new ArrayList<NodeSchool>();
                            nodeCampus.setSchools(nodeSchoolList);
                        }
                        NodeSchool nodeSchool = new NodeSchool();
                        nodeSchool.setSchool(account_id);
                        nodeSchoolMap.put(account_id, nodeSchool);
                        nodeSchoolList.add(nodeSchool);
                    }
                } // it is a dept!
                else {
                    NodeSchool nodeSchool = nodeSchoolMap.get(parent_account_id);

                    if (nodeSchool != null) {
                        List<String> departmentList = nodeSchool.getDepartments();
                        if (departmentList == null) {
                            departmentList = new ArrayList<String>();
                            nodeSchool.setDepartments(departmentList);
                        }
                        String department = account_id;
                        departmentList.add(department);
                    }
                }
            }

        }

        long end = System.currentTimeMillis();
        log.debug("NodeHierarchy took " + (end - start) + " millis");

        return nodeHierarchys;
    }

    public List<NodeCampus> getHierarchyForSubAccountFromCanvas(String subAccount) {
        return getHierarchyForSubAccountFromCanvas(accountService.getSubAccounts(), subAccount);
    }

    public List<NodeCampus> getHierarchyForSubAccountFromCanvas(List<Account> accounts, String subAccount) {
        List<NodeCampus> nodeHierarchys = new ArrayList<NodeCampus>();

        if (accounts.size() > 0) {
            NodeCampus nodeCampus = null;

            for (Account account : accounts) {

                if (subAccount.equals(account.getId()) || subAccount.equals(account.getParentAccountId())) {
                    if (subAccount.equals(account.getId())) {
                        // this is a campus
                        nodeCampus = new NodeCampus();
                        nodeCampus.setCampus(account.getName());
                        nodeCampus.setSchools(new ArrayList<NodeSchool>());
                        nodeHierarchys.add(nodeCampus);
                    } else {
                        // This is a school
                        NodeSchool nodeSchool = new NodeSchool();
                        nodeSchool.setSchool(account.getName());
                        nodeSchool.setDepartments(new ArrayList<String>());
                        nodeCampus.getSchools().add(nodeSchool);
                    }
                }
            }
            if (nodeCampus != null) {
                Collections.sort(nodeCampus.getSchools());
            }
        }

        return nodeHierarchys;
    }

    //TODO keep an eye on this one after SISImportServiceImpl conversion
    // likely don't need the Transactional on this method
//    @Transactional
    public String writeHierarchy(List<NodeCampus> nodeHierarchys) {
        nodeHierarchyRepository.deleteAll();
        NodeWrapper nodeWrapper = new NodeWrapper();
        nodeWrapper.setCampusList(nodeHierarchys);
        nodeHierarchyRepository.save(nodeWrapper);

        return "Hierarchy created";
    }

    public List<NodeCampus> readHierarchy() {
        List<NodeCampus> nodeHierarchys = null;
        NodeWrapper nodeWrapper = nodeHierarchyRepository.findTop1ByOrderByModifiedDesc();

        if (nodeWrapper != null) {
            nodeHierarchys = nodeWrapper.getCampusList();
        }

        return nodeHierarchys;
    }

    public List<String> getFlattenedHierarchy() {
        List<String> flattened = new ArrayList<>();
        List<NodeCampus> hierarchy = readHierarchy();
        for (NodeCampus campus : hierarchy) {
            flattened.add(campus.getCampus());
            for (NodeSchool school : campus.getSchools()) {
                flattened.add(school.getSchool());
                if (school.getDepartments() != null) {
                    flattened.addAll(school.getDepartments());
                }
            }
        }

        return flattened;
    }
}
