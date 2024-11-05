// controllers/agency.controller.js
const Agency = require('../models/agency.model');
const { ApiError } = require('../utils/api-error');

class AgencyController {
	static async createAgency(req, res, next) {
		try {
			const userId = req.user.id;
			const {
				company_name,
				license_number,
				description,
				address,
				website,
				employee_count,
				established_year,
				specialties,
				service_areas,
			} = req.body;

			// Check if user already has an agency
			const existingAgency = await Agency.findByUserId(userId);
			if (existingAgency) {
				throw new ApiError(400, 'User already has an agency');
			}

			const agencyId = await Agency.create({
				user_id: userId,
				company_name,
				license_number,
				description,
				address,
				website,
				employee_count,
				established_year,
				specialties,
				service_areas,
			});

			const agency = await Agency.findById(agencyId);

			res.status(201).json({
				status: 'success',
				data: { agency },
			});
		} catch (error) {
			next(error);
		}
	}

	static async registerAgency(req, res, next) {
		try {
			const userId = req.user.id;
			const {
				company_name,
				license_number,
				description,
				address,
				website,
				employee_count,
				established_year,
				specialties,
				service_areas,
			} = req.body;

			// Check if user already has an agency
			const existingAgency = await Agency.findByUserId(userId);
			if (existingAgency) {
				throw new ApiError(400, 'User already has an agency');
			}

			const agencyId = await Agency.create({
				user_id: userId,
				company_name,
				license_number,
				description,
				address,
				website,
				employee_count,
				established_year,
				specialties,
				service_areas,
			});

			const agency = await Agency.findById(agencyId);

			res.status(201).json({
				status: 'success',
				data: { agency },
			});
		} catch (error) {
			next(error);
		}
    }
    
    static async getAllAgencies(req, res, next) {
        try {
            const agencies = await Agency.findAll();
            res.json({
                status: 'success',
                data: { agencies },
            });
        } catch (error) {
            next(error);
        }
    }

	static async getAgency(req, res, next) {
		try {
			const { id } = req.params;
			const agency = await Agency.findById(id);
			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}
			res.json({
				status: 'success',
				data: { agency },
			});
		} catch (error) {
			next(error);
		}
    }
    
    static async getAgencyById(req, res, next) {
        try {
            const { id } = req.params;
            const agency = await Agency.findById(id);
            if (!agency) {
                throw new ApiError(404, 'Agency not found');
            }
            res.json({
                status: 'success',
                data: { agency },
            });
        } catch (error) {
            next(error);
        }
    }

	static async getAgencyProfile(req, res, next) {
		try {
			const { id } = req.params;
			const agency = await Agency.findById(id);
			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}
			res.json({
				status: 'success',
				data: { agency },
			});
		} catch (error) {
			next(error);
		}
    }
    
    static async getPublicAgencyGuides(req, res, next) {
        try {
            const { id } = req.params;
            const agency = await Agency.findById(id);
            if (!agency) {
                throw new ApiError(404, 'Agency not found');
            }
            res.json({
                status: 'success',
                data: { guides: agency.guides },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAgencyTours(req, res, next) {
        try {
            const { id } = req.params;
            const agency = await Agency.findById(id);
            if (!agency) {
                throw new ApiError(404, 'Agency not found');
            }
            res.json({
                status: 'success',
                data: { tours: agency.tours },
            });
        } catch (error) {
            next(error);
        }
    }

	static async updateAgency(req, res, next) {
		try {
			const { id } = req.params;
			const agency = await Agency.findById(id);

			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}

			// Check ownership
			if (agency.user_id !== req.user.id && req.user.role !== 'admin') {
				throw new ApiError(403, 'Not authorized');
			}

			const updated = await Agency.update(id, req.body);
			const updatedAgency = await Agency.findById(id);

			res.json({
				status: 'success',
				data: { agency: updatedAgency },
			});
		} catch (error) {
			next(error);
		}
	}

	static async updateAgencyProfile(req, res, next) {
		try {
			const { id } = req.params;
			const agency = await Agency.findById(id);

			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}

			// Check ownership
			if (agency.user_id !== req.user.id && req.user.role !== 'admin') {
				throw new ApiError(403, 'Not authorized');
			}

			const updated = await Agency.update(id, req.body);
			const updatedAgency = await Agency.findById(id);

			res.json({
				status: 'success',
				data: { agency: updatedAgency },
			});
		} catch (error) {
			next(error);
		}
	}

	static async getAgencyProfile(req, res, next) {
		try {
			const { id } = req.params;
			const agency = await Agency.findById(id);

			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}

			res.json({
				status: 'success',
				data: { agency },
			});
		} catch (error) {
			next(error);
		}
	}

	static async deleteAgency(req, res, next) {
		try {
			const { id } = req.params;
			const agency = await Agency.findById(id);

			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}

			// Check ownership
			if (agency.user_id !== req.user.id && req.user.role !== 'admin') {
				throw new ApiError(403, 'Not authorized');
			}

			await Agency.remove(id);
			res.json({
				status: 'success',
				message: 'Agency deleted successfully',
			});
		} catch (error) {
			next(error);
		}
	}

	static async addGuideToAgency(req, res, next) {
		try {
			const { id } = req.params;
			const { guide_id } = req.body;
			const agency = await Agency.findById(id);

			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}

			// Check ownership
			if (agency.user_id !== req.user.id && req.user.role !== 'admin') {
				throw new ApiError(403, 'Not authorized');
			}

			await Agency.addGuide(id, guide_id);
			res.json({
				status: 'success',
				message: 'Guide added to agency successfully',
			});
		} catch (error) {
			next(error);
		}
	}

	static async removeGuideFromAgency(req, res, next) {
		try {
			const { id } = req.params;
			const { guide_id } = req.body;
			const agency = await Agency.findById(id);

			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}

			// Check ownership
			if (agency.user_id !== req.user.id && req.user.role !== 'admin') {
				throw new ApiError(403, 'Not authorized');
			}

			await Agency.removeGuide(id, guide_id);
			res.json({
				status: 'success',
				message: 'Guide removed from agency successfully',
			});
		} catch (error) {
			next(error);
		}
	}

	static async getAgencyGuides(req, res, next) {
		try {
			const { id } = req.params;
			const agency = await Agency.findById(id);

			if (!agency) {
				throw new ApiError(404, 'Agency not found');
			}

			res.json({
				status: 'success',
				data: { guides: agency.guides },
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = AgencyController;
