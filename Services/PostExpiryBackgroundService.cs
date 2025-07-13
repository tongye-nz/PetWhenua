namespace PetWhenua.Services
{
    /// <summary>
    /// Background service that runs daily to automatically expire posts with past event dates
    /// </summary>
    public class PostExpiryBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PostExpiryBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(24); // Run daily

        public PostExpiryBackgroundService(IServiceProvider serviceProvider, ILogger<PostExpiryBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Post Expiry Background Service starting");

            // Calculate initial delay to run at 2 AM daily
            var initialDelay = GetTimeUntilNextRun();
            if (initialDelay > TimeSpan.Zero)
            {
                _logger.LogInformation("Waiting {InitialDelay} until first expiry check at 2:00 AM", initialDelay);
                await Task.Delay(initialDelay, stoppingToken);
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RunExpiryCheckAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during scheduled post expiry check");
                }

                // Wait for the next check interval
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Post Expiry Background Service stopping");
        }

        private async Task RunExpiryCheckAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var expiryService = scope.ServiceProvider.GetRequiredService<PostExpiryService>();

            _logger.LogInformation("Starting scheduled post expiry check");

            try
            {
                var expiredCount = await expiryService.ExpirePostsByEventDateAsync();
                
                if (expiredCount > 0)
                {
                    _logger.LogInformation("Scheduled expiry check completed successfully. {ExpiredCount} posts expired", expiredCount);
                }
                else
                {
                    _logger.LogDebug("Scheduled expiry check completed. No posts needed expiration");
                }

                // Get and log expiry statistics
                var stats = await expiryService.GetExpiryStatsAsync();
                _logger.LogInformation(
                    "Expiry stats: {TotalExpirable} expirable posts, {TotalActive} active time-based posts",
                    stats.TotalExpirablePosts, stats.TotalActiveTimeBasedPosts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to complete scheduled post expiry check");
                throw;
            }
        }

        /// <summary>
        /// Calculates the time until the next 2:00 AM run
        /// </summary>
        private TimeSpan GetTimeUntilNextRun()
        {
            var now = DateTime.Now;
            var nextRun = DateTime.Today.AddHours(2); // 2:00 AM today

            // If it's already past 2:00 AM today, schedule for 2:00 AM tomorrow
            if (now >= nextRun)
            {
                nextRun = nextRun.AddDays(1);
            }

            return nextRun - now;
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Post Expiry Background Service is stopping");
            await base.StopAsync(stoppingToken);
        }
    }
}
