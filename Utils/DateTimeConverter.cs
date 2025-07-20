using System.Text.Json;
using System.Text.Json.Serialization;

namespace PetWhenua.Utils
{
    /// <summary>
    /// Custom DateTime converter to ensure all DateTime values are properly serialized as UTC with timezone information
    /// </summary>
    public class UtcDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var dateTimeString = reader.GetString();
            if (DateTime.TryParse(dateTimeString, out var dateTime))
            {
                // If the parsed DateTime doesn't have timezone info, assume it's UTC
                if (dateTime.Kind == DateTimeKind.Unspecified)
                {
                    return DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
                }
                // Convert to UTC if it's not already
                return dateTime.ToUniversalTime();
            }
            throw new JsonException($"Unable to parse DateTime: {dateTimeString}");
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // Always write DateTime as UTC with 'Z' suffix
            var utcDateTime = value.Kind switch
            {
                DateTimeKind.Local => value.ToUniversalTime(),
                DateTimeKind.Unspecified => DateTime.SpecifyKind(value, DateTimeKind.Utc),
                _ => value
            };
            
            writer.WriteStringValue(utcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
        }
    }

    /// <summary>
    /// Custom nullable DateTime converter
    /// </summary>
    public class UtcNullableDateTimeConverter : JsonConverter<DateTime?>
    {
        public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            var dateTimeString = reader.GetString();
            if (string.IsNullOrEmpty(dateTimeString))
                return null;

            if (DateTime.TryParse(dateTimeString, out var dateTime))
            {
                // If the parsed DateTime doesn't have timezone info, assume it's UTC
                if (dateTime.Kind == DateTimeKind.Unspecified)
                {
                    return DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
                }
                // Convert to UTC if it's not already
                return dateTime.ToUniversalTime();
            }
            throw new JsonException($"Unable to parse DateTime: {dateTimeString}");
        }

        public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            // Always write DateTime as UTC with 'Z' suffix
            var utcDateTime = value.Value.Kind switch
            {
                DateTimeKind.Local => value.Value.ToUniversalTime(),
                DateTimeKind.Unspecified => DateTime.SpecifyKind(value.Value, DateTimeKind.Utc),
                _ => value.Value
            };
            
            writer.WriteStringValue(utcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
        }
    }

    /// <summary>
    /// Static utility class for timezone operations
    /// </summary>
    public static class TimeZoneHelper
    {
        /// <summary>
        /// New Zealand timezone info
        /// </summary>
        public static readonly TimeZoneInfo NzTimeZone = TimeZoneInfo.FindSystemTimeZoneById("New Zealand Standard Time");

        /// <summary>
        /// Convert UTC DateTime to New Zealand time
        /// </summary>
        public static DateTime ToNzTime(DateTime utcDateTime)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, NzTimeZone);
        }

        /// <summary>
        /// Convert New Zealand time to UTC
        /// </summary>
        public static DateTime ToUtc(DateTime nzDateTime)
        {
            return TimeZoneInfo.ConvertTimeToUtc(nzDateTime, NzTimeZone);
        }

        /// <summary>
        /// Get current New Zealand time
        /// </summary>
        public static DateTime NowInNz => ToNzTime(DateTime.UtcNow);

        /// <summary>
        /// Format DateTime for New Zealand display
        /// </summary>
        public static string FormatForNz(DateTime utcDateTime, string format = "yyyy-MM-dd HH:mm:ss")
        {
            return ToNzTime(utcDateTime).ToString(format);
        }

        /// <summary>
        /// Format nullable DateTime for New Zealand display
        /// </summary>
        public static string FormatForNz(DateTime? utcDateTime, string format = "yyyy-MM-dd HH:mm:ss", string nullText = "Never")
        {
            if (utcDateTime == null)
                return nullText;
                
            return FormatForNz(utcDateTime.Value, format);
        }
    }
} 