package edu.iu.uits.lms.hierarchyresourcemanager.services;

import edu.iu.uits.lms.canvas.model.Account;
import edu.iu.uits.lms.canvas.services.AccountService;
import edu.iu.uits.lms.canvas.services.CanvasService;
import edu.iu.uits.lms.iuonly.model.nodehierarchy.HierarchyNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NodeHierarchyRealtimeService {
    @Autowired
    private AccountService accountService;
    @Autowired
    private CanvasService canvasService;

    public List<String> getFlattenedHierarchy() {
        List<Account> accounts = accountService.getSubAccounts();

        List<HierarchyNode> hierarchyNodes = buildHierarchyForAllAccounts(accounts);

        return recursiveFlatten(hierarchyNodes);
    }

    /**
     * Return the hierarchy based off of canvas accounts
     * @param accounts
     * @return
     */
    private List<HierarchyNode> buildHierarchyForAllAccounts(List<Account> accounts) {
        Map<String, List<HierarchyNode>> childrenForParentHierarchyMap = new HashMap<>();
        Map<String, HierarchyNode> hierarchyMap = new HashMap<>();

        final String rootAccountId = "root";

        Account rootAccount = new Account();
        rootAccount.setId(canvasService.getRootAccount());
        rootAccount.setName("Indiana University");
        rootAccount.setParentAccountId(rootAccountId);

        accounts.add(rootAccount);

        for (Account account : accounts) {
            HierarchyNode hierarchyNode = new HierarchyNode();
            hierarchyNode.setId(account.getId());
            hierarchyNode.setName(account.getName());

            String parentId = account.getParentAccountId();

            if (! childrenForParentHierarchyMap.containsKey(parentId)) {
                childrenForParentHierarchyMap.put(parentId, new ArrayList<>());
            }

            hierarchyMap.put(account.getId(), hierarchyNode);
            childrenForParentHierarchyMap.get(parentId).add(hierarchyNode);
        }

        for (HierarchyNode hierarchyNode : hierarchyMap.values()) {
            String id = hierarchyNode.getId();
            List<HierarchyNode> childrenList = childrenForParentHierarchyMap.get(id) == null ? new ArrayList<>() : childrenForParentHierarchyMap.get(id);

            childrenList = childrenList.stream()
                    .sorted(Comparator.comparing(HierarchyNode::getName))
                    .collect(Collectors.toList());

            hierarchyNode.setChildren(childrenList);
        }

        // return root node list
        return childrenForParentHierarchyMap.get(rootAccountId);
    }

    private List<String> recursiveFlatten(List<HierarchyNode> hierarchyNodes) {
        List<String> flattened = new ArrayList<>();

        for (HierarchyNode hierarchyNode : hierarchyNodes) {
            flattened.add(hierarchyNode.getName());
            flattened.addAll(recursiveFlatten(hierarchyNode.getChildren()));
        }

        return flattened;
    }


}
