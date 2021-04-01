package edu.iu.uits.lms.hierarchyresourcemanager.model.nodehierarchy;

import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectStreamClass;

/**
 * This class exists to convert the monolith packages stored in the byte array from the db to the microservices
 * version of the packages. Once the accounts hierarchy has been converted, this class can go away.
 */
public class HackedObjectInputStream extends ObjectInputStream {

    public HackedObjectInputStream(InputStream in) throws IOException {
        super(in);
    }

    @Override
    protected ObjectStreamClass readClassDescriptor() throws IOException, ClassNotFoundException {
        ObjectStreamClass resultClassDescriptor = super.readClassDescriptor();

        if (resultClassDescriptor.getName().equals("edu.iu.uits.lms.services.ws.model.nodehierarchy.NodeCampus")) {
            resultClassDescriptor = ObjectStreamClass.lookup(NodeCampus.class);
        }

        if (resultClassDescriptor.getName().equals("edu.iu.uits.lms.services.ws.model.nodehierarchy.NodeSchool")) {
            resultClassDescriptor = ObjectStreamClass.lookup(NodeSchool.class);
        }

        return resultClassDescriptor;
    }
}
