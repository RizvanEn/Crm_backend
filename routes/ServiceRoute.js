import express from "express";
import { ServiceModel } from "../models/ServiceModel.js";

const ServiceRoutes = express.Router();

// Route to add a new service
ServiceRoutes.post('/api/services', async (req, res) => {
    const { name, value, status } = req.body;

    // Validate input
    if (!name || !value|| !status) {
        return res.status(400).send('Invalid input data');
    }

    // Create and save the service
    const service ={
        name,
        value,
        status
    }

    try {
        const Service = await ServiceModel.create(service);
        res.status(201).send({ message: 'Service added successfully', Service });
    } catch (error) {
        res.status(500).send({ message: 'Error adding service', error: error.message });
    }
});

//edite service
ServiceRoutes.patch('/api/services/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Ensure there are fields to update
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).send({ message: 'No fields provided for update' });
    }

    try {
        // Update the service with provided fields
        const updatedService = await ServiceModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true } // Return updated document and validate inputs
        );

        if (!updatedService) {
            return res.status(404).send({ message: 'Service not found' });
        }

        res.status(200).send({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
        res.status(500).send({ message: 'Error updating service', error: error.message });
    }
});

export default ServiceRoutes;