import { Driver } from "../driver/driver.model";
import { STATUS } from "../ride/ride.interface";
import { Ride } from "../ride/ride.model";
import { IS_ACTIVE, ROLE } from "../user/user.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const getUserStats = async () => {
    const totalUsersPromise = User.countDocuments();

    const totalActiveRidersPromise = User.countDocuments({
        isActive: IS_ACTIVE.ACTIVE,
        role: ROLE.RIDER,
    });

    const totalBlockedRidersPromise = User.countDocuments({
        isActive: IS_ACTIVE.BLOCKED,
        role: ROLE.RIDER,
    });

    const newUsersInLast7DaysPromise = User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });

    const newUsersInLast30DaysPromise = User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });

    const usersByRolePromise = User.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ]);

    const [
        totalUsers,
        totalActiveRiders,
        totalBlockedRiders,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole,
    ] = await Promise.all([
        totalUsersPromise,
        totalActiveRidersPromise,
        totalBlockedRidersPromise,
        newUsersInLast7DaysPromise,
        newUsersInLast30DaysPromise,
        usersByRolePromise,
    ]);

    return {
        totalUsers,
        totalActiveRiders,
        totalBlockedRiders,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole,
    };
};

const getDriverStats = async () => {
    const driversByApprovalStatusPromise = Driver.aggregate([
        { $group: { _id: "$approvalStatus", count: { $sum: 1 } } },
    ]);

    const topDriversPromise = Ride.aggregate([
        { $match: { status: STATUS.COMPLETED } },
        {
            $group: {
                _id: "$driver",
                totalRides: { $sum: 1 },
                totalEarnings: { $sum: "$fare" },
            },
        },
        {
            $lookup: {
                from: "drivers",
                localField: "_id",
                foreignField: "_id",
                as: "driver",
            },
        },
        { $unwind: "$driver" },
        {
            $lookup: {
                from: "users",
                localField: "driver.user",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        {
            $project: {
                _id: 0,
                driverId: "$driver._id",
                name: "$user.name",
                email: "$user.email",
                totalRides: 1,
                totalEarnings: 1,
            },
        },
        { $sort: { totalRides: -1 } },
        { $limit: 10 },
    ]);

    const [driversByApprovalStatus, topDrivers] = await Promise.all([
        driversByApprovalStatusPromise,
        topDriversPromise,
    ]);

    return { driversByApprovalStatus, topDrivers };
};

const getRideStats = async () => {
    const totalRidesPromise = Ride.countDocuments();
    const completedRidesPromise = Ride.countDocuments({ status: STATUS.COMPLETED });
    const canceledRidesPromise = Ride.countDocuments({ status: STATUS.CANCELED });

    const totalRevenuePromise = Ride.aggregate([
        { $match: { status: STATUS.COMPLETED } },
        { $group: { _id: null, totalRevenue: { $sum: "$fare" } } },
    ]);

    const dailyRideTrendsPromise = Ride.aggregate([
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                    },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: -1 } },
    ]);

    const dailyRevenueTrendsPromise = Ride.aggregate([
        { $match: { status: STATUS.COMPLETED } },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$completedAt",
                    },
                },
                revenue: { $sum: "$fare" },
                rides: { $sum: 1 },
            },
        },
        { $sort: { _id: -1 } },
    ]);

    const [
        totalRides,
        completedRides,
        canceledRides,
        totalRevenue,
        dailyRideTrends,
        dailyRevenueTrends,
    ] = await Promise.all([
        totalRidesPromise,
        completedRidesPromise,
        canceledRidesPromise,
        totalRevenuePromise,
        dailyRideTrendsPromise,
        dailyRevenueTrendsPromise,
    ]);

    return {
        totalRides,
        completedRides,
        canceledRides,
        totalRevenue: totalRevenue[0]?.totalRevenue || 0,
        dailyRideTrends,
        dailyRevenueTrends,
    };
};

const getDriverEarningsStats = async (userId: string) => {
    const driver = await Driver.findOne({ user: userId });

    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
    }

    const matchCompletedRide = {
        driver: driver._id,
        status: STATUS.COMPLETED,
    };

    const todayStatsPromise = Ride.aggregate([
        {
            $match: {
                ...matchCompletedRide,
                completedAt: { $gte: startOfToday },
            },
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$fare" },
                totalRides: { $sum: 1 },
            },
        },
    ]);

    const weeklyStatsPromise = Ride.aggregate([
        {
            $match: {
                ...matchCompletedRide,
                completedAt: { $gte: sevenDaysAgo },
            },
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$fare" },
                totalRides: { $sum: 1 },
            },
        },
    ]);

    const monthlyStatsPromise = Ride.aggregate([
        {
            $match: {
                ...matchCompletedRide,
                completedAt: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$fare" },
                totalRides: { $sum: 1 },
            },
        },
    ]);

    const totalStatsPromise = Ride.aggregate([
        { $match: matchCompletedRide },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: "$fare" },
                totalRides: { $sum: 1 },
            },
        },
    ]);

    const earningsChartPromise = Ride.aggregate([
        {
            $match: {
                ...matchCompletedRide,
                completedAt: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$completedAt",
                    },
                },
                total: { $sum: "$fare" },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const [today, weekly, monthly, total, chart] = await Promise.all([
        todayStatsPromise,
        weeklyStatsPromise,
        monthlyStatsPromise,
        totalStatsPromise,
        earningsChartPromise,
    ]);

    return {
        today: {
            earnings: today[0]?.totalEarnings || 0,
            rides: today[0]?.totalRides || 0,
        },
        weekly: {
            earnings: weekly[0]?.totalEarnings || 0,
            rides: weekly[0]?.totalRides || 0,
        },
        monthly: {
            earnings: monthly[0]?.totalEarnings || 0,
            rides: monthly[0]?.totalRides || 0,
        },
        total: {
            earnings: total[0]?.totalEarnings || 0,
            rides: total[0]?.totalRides || 0,
        },
        chartData: chart,
    };
};

export const StatsService = {
    getUserStats,
    getDriverStats,
    getRideStats,
    getDriverEarningsStats,
};
